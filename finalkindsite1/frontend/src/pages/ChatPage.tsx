"use client"

import type React from "react"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Loader2, Send, Upload, LogOut, Settings, BookOpen, Edit3 } from "lucide-react"
import { ThemeToggle } from "../components/ThemeToggle"
import ConversationsSheet from "../components/ConversationsSheet"
import { api } from "../lib/api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

type Preferences = {
  id: string
  has_reading_difficulty: boolean
  has_motion_sensitivity: boolean
  has_color_sensitivity: boolean
  prefers_large_text: boolean
  prefers_reduced_motion: boolean
  prefers_high_contrast: boolean
}

const DEFAULT_PREFS: Omit<Preferences, "id"> = {
  has_reading_difficulty: false,
  has_motion_sensitivity: false,
  has_color_sensitivity: false,
  prefers_large_text: false,
  prefers_reduced_motion: false,
  prefers_high_contrast: false,
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [userPreferences, setUserPreferences] = useState<Preferences | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Dialog state + edit buffer
  const [prefOpen, setPrefOpen] = useState(false)
  const [editPrefs, setEditPrefs] = useState<Omit<Preferences, "id">>(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)


  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 = No rows found
          console.error("Error loading preferences:", error)
        }

        if (data) {
          setUserPreferences(data as Preferences)
          setEditPrefs({
            has_reading_difficulty: !!data.has_reading_difficulty,
            has_motion_sensitivity: !!data.has_motion_sensitivity,
            has_color_sensitivity: !!data.has_color_sensitivity,
            prefers_large_text: !!data.prefers_large_text,
            prefers_reduced_motion: !!data.prefers_reduced_motion,
            prefers_high_contrast: !!data.prefers_high_contrast,
          })
        } else {
          // If no row, prep defaults
          setUserPreferences({
            id: user.id,
            ...DEFAULT_PREFS,
          })
          setEditPrefs(DEFAULT_PREFS)
        }
      } catch (err) {
        console.error("Error loading preferences:", err)
      }
    }

    loadPreferences()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isStreaming || !user) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsStreaming(true)

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const cid = await ensureConversation() // <- ensure thread exists

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          conversationId: cid,       // <- IMPORTANT
          // sessionId,               // keep only if your backend still uses it
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = JSON.parse(line.slice(6))

            if (data.type === "text") {
              assistantMessage.content += data.content
              setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
            } else if (data.type === "done") {
              // backend should echo conversationId here on first turn
              if (data.conversationId && !conversationId) setConversationId(data.conversationId)
              break
            } else if (data.type === "error") {
              console.error("Stream error:", data.error)
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setIsStreaming(false)
    }
  }


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `I've uploaded a file: ${file.name}. Please make it more accessible based on my preferences.`,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsStreaming(true)

      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const cid = await ensureConversation() // <- ensure thread exists

        const response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
              experimental_attachments:
                m.role === "user" ? [{ name: file.name, contentType: file.type, url: base64 }] : undefined,
            })),
            conversationId: cid,     // <- IMPORTANT
            // sessionId,             // keep only if your backend still uses it
          }),
        })

        const streamReader = response.body?.getReader()
        const decoder = new TextDecoder()

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
        }
        setMessages((prev) => [...prev, assistantMessage])

        if (streamReader) {
          while (true) {
            const { done, value } = await streamReader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue
              const data = JSON.parse(line.slice(6))

              if (data.type === "text") {
                assistantMessage.content += data.content
                setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
              } else if (data.type === "done") {
                if (data.conversationId && !conversationId) setConversationId(data.conversationId)
                break
              }
            }
          }
        }
      } catch (error) {
        console.error("File upload error:", error)
      } finally {
        setIsStreaming(false)
      }
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) fileInputRef.current.value = ""
  }


  const openPrefEditor = () => {
    setPrefOpen(true)
  }

  const toggleField =
    (key: keyof Omit<Preferences, "id">) =>
    (checked: boolean) => {
      setEditPrefs((prev) => ({ ...prev, [key]: checked }))
    }

  const savePreferences = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = {
        id: user.id,
        ...editPrefs,
      }

      // Use upsert to create row if none exists
      const { data, error } = await supabase.from("user_preferences").upsert(payload).select().single()
      if (error) throw error

      setUserPreferences(data as Preferences)
      setPrefOpen(false)
    } catch (err) {
      console.error("Saving preferences failed:", err)
      // optional: surface a toast
    } finally {
      setSaving(false)
    }
  }

  async function ensureConversation(): Promise<string> {
  if (conversationId) return conversationId
  const res = await api.createConversation("New conversation")
  const cid = res.conversation.id as string
  setConversationId(cid)
  return cid
  }

  async function openConversation(cid: string) {
  const res = await api.getConversationMessages(cid)
  const loaded: Message[] = (res.messages ?? []).map((m: any) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }))
  setConversationId(cid)
  setMessages(loaded)
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
              <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LearnAccess
            </span>
          </div>
          <nav aria-label="User navigation">
            <div className="flex items-center gap-2">
              <ConversationsSheet
                currentConversationId={conversationId}
                onOpenConversation={openConversation}
                onNewConversation={(cid) => {
                  setConversationId(cid)
                  setMessages([])
                }}
              />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/preferences")}
                aria-label="Settings"
                className="hover:bg-primary/10 transition-all hover:scale-110"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="hover:bg-destructive/10 transition-all hover:scale-110"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4" role="main" aria-label="Chat messages">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center animate-fade-in-up border-primary/20">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to LearnAccess
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Upload educational content, and I'll help make it more accessible based on your learning preferences.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/50 p-4 text-left transition-all hover:border-primary/50 hover:shadow-md">
                  <h3 className="font-semibold text-foreground">Try asking:</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>"Make this PDF easier to read"</li>
                    <li>"Convert this image to accessible text"</li>
                    <li>"Simplify this document"</li>
                  </ul>
                </div>

                {/* CLICKABLE PREFERENCES CARD */}
                <button
                  type="button"
                  onClick={openPrefEditor}
                  className="text-left rounded-lg border border-border bg-muted/50 p-4 transition-all hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Open preferences editor"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Your preferences</h3>
                    <Button type="button" size="sm" variant="outline" className="gap-2">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {userPreferences?.has_reading_difficulty && <li>✓ Reading support enabled</li>}
                    {userPreferences?.has_motion_sensitivity && <li>✓ Motion sensitivity mode</li>}
                    {userPreferences?.has_color_sensitivity && <li>✓ Color sensitivity mode</li>}
                    {userPreferences?.prefers_large_text && <li>✓ Large text preferred</li>}
                    {userPreferences?.prefers_reduced_motion && <li>✓ Reduced motion</li>}
                    {userPreferences?.prefers_high_contrast && <li>✓ High contrast mode</li>}
                    {!userPreferences ||
                      (!Object.values({ ...(userPreferences ?? {}), id: undefined }).some(Boolean) && (
                        <li>No preferences selected yet</li>
                      ))}
                  </ul>
                </button>
              </div>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              role="article"
              aria-label={`${message.role === "user" ? "Your" : "Assistant"} message`}
            >
              <Card
                className={`max-w-[80%] p-4 transition-all hover:shadow-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-accent text-white border-primary/50"
                    : "bg-card border-border/50"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
              </Card>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start animate-fade-in" role="status" aria-live="polite">
              <Card className="max-w-[80%] p-4 bg-card border-primary/30">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card/80 backdrop-blur-lg p-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-3xl">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload file"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              aria-label="Upload file"
              className="hover:bg-primary/10 hover:border-primary/50 transition-all hover:scale-110"
            >
              <Upload className="h-5 w-5" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe what you need help with..."
              disabled={isStreaming}
              className="flex-1 transition-all focus:border-primary/50"
              aria-label="Message input"
            />
            <Button
              type="submit"
              disabled={isStreaming || !inputValue.trim()}
              aria-label="Send message"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-110"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </footer>

      {/* Preferences Dialog */}
      <Dialog open={prefOpen} onOpenChange={setPrefOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit learning & accessibility preferences</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="reading">Reading support</Label>
                <p className="text-sm text-muted-foreground">Simplify text, add summaries & scaffolds</p>
              </div>
              <Switch
                id="reading"
                checked={editPrefs.has_reading_difficulty}
                onCheckedChange={toggleField("has_reading_difficulty")}
                aria-label="Toggle reading support"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="motion">Motion sensitivity</Label>
                <p className="text-sm text-muted-foreground">Reduce/avoid motion & parallax</p>
              </div>
              <Switch
                id="motion"
                checked={editPrefs.has_motion_sensitivity}
                onCheckedChange={toggleField("has_motion_sensitivity")}
                aria-label="Toggle motion sensitivity"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="color">Color sensitivity</Label>
                <p className="text-sm text-muted-foreground">Avoid problematic color pairings</p>
              </div>
              <Switch
                id="color"
                checked={editPrefs.has_color_sensitivity}
                onCheckedChange={toggleField("has_color_sensitivity")}
                aria-label="Toggle color sensitivity"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="largeText">Large text</Label>
                <p className="text-sm text-muted-foreground">Prefer larger font sizes</p>
              </div>
              <Switch
                id="largeText"
                checked={editPrefs.prefers_large_text}
                onCheckedChange={toggleField("prefers_large_text")}
                aria-label="Toggle large text"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="reducedMotion">Reduced motion</Label>
                <p className="text-sm text-muted-foreground">Minimize non-essential animations</p>
              </div>
              <Switch
                id="reducedMotion"
                checked={editPrefs.prefers_reduced_motion}
                onCheckedChange={toggleField("prefers_reduced_motion")}
                aria-label="Toggle reduced motion"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="highContrast">High contrast</Label>
                <p className="text-sm text-muted-foreground">Boost contrast for readability</p>
              </div>
              <Switch
                id="highContrast"
                checked={editPrefs.prefers_high_contrast}
                onCheckedChange={toggleField("prefers_high_contrast")}
                aria-label="Toggle high contrast mode"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPrefOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
