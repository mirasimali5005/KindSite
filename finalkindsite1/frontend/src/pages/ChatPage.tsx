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

// ---------------------- Prefs types + mappers (UI ↔ DB) ----------------------

type UIPreferences = {
  dyslexia: boolean
  cognitive_impairment: boolean
  visual_impairment: boolean
  adhd: boolean
  esl_simple_english: boolean
}

type DBPreferences = {
  id: string
  has_reading_difficulty: boolean
  has_motion_sensitivity: boolean
  has_color_sensitivity: boolean
  prefers_large_text: boolean
  prefers_reduced_motion: boolean
  prefers_high_contrast: boolean
}

const DEFAULT_UI_PREFS: UIPreferences = {
  dyslexia: false,
  cognitive_impairment: false,
  visual_impairment: false,
  adhd: false,
  esl_simple_english: false,
}

function prefsToUI(db: Partial<DBPreferences> | null | undefined): UIPreferences {
  return {
    dyslexia: !!db?.has_reading_difficulty,
    cognitive_impairment: !!db?.has_motion_sensitivity,
    visual_impairment: !!db?.has_color_sensitivity,
    adhd: !!db?.prefers_large_text,
    esl_simple_english: !!db?.prefers_reduced_motion,
  }
}

function prefsToDB(ui: UIPreferences, id: string): DBPreferences {
  return {
    id,
    has_reading_difficulty: ui.dyslexia,
    has_motion_sensitivity: ui.cognitive_impairment,
    has_color_sensitivity: ui.visual_impairment,
    prefers_large_text: ui.adhd,
    prefers_reduced_motion: ui.esl_simple_english,
    prefers_high_contrast: false, // add a UI toggle later if you want this
  }
}

// ---------------------- Messages ----------------------

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// ---------------------- Component ----------------------

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)

  const [userPreferences, setUserPreferences] = useState<UIPreferences>(DEFAULT_UI_PREFS)
  const [editPrefs, setEditPrefs] = useState<UIPreferences>(DEFAULT_UI_PREFS)

  const [saving, setSaving] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Dialog state
  const [prefOpen, setPrefOpen] = useState(false)

  // Render processor URL (Gemini worker)
  const PROCESS_URL = "https://kindsite-1.onrender.com/process"

  // Simple preset selector driving the API field
  const [preset, setPreset] = useState<
    "dyslexia" | "cognitive_impairment" | "visual_impairment" | "adhd" | "esl_simple_english"
  >("cognitive_impairment")

  // ---------------------- Effects ----------------------

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select(
            "id, has_reading_difficulty, has_motion_sensitivity, has_color_sensitivity, prefers_large_text, prefers_reduced_motion, prefers_high_contrast"
          )
          .eq("id", user.id)
          .maybeSingle()

        if (error && (error as any).code !== "PGRST116") {
          console.error("Error loading preferences:", error)
        }

        const ui = prefsToUI(data as Partial<DBPreferences> | null)
        setUserPreferences(ui)
        setEditPrefs(ui)
      } catch (err) {
        console.error("Error loading preferences:", err)
      }
    }

    loadPreferences()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ---------------------- Helpers ----------------------

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  // Build the exact request Render expects (multipart/form-data)
  async function postToProcessor(opts: { preset: string; file?: File; text?: string }) {
    const fd = new FormData()
    fd.append("accessibility_preset", opts.preset)
    if (opts.file) fd.append("file_input", opts.file, opts.file.name)
    if (opts.text) fd.append("text_input", opts.text)

    const res = await fetch(PROCESS_URL, {
      method: "POST",
      body: fd, // IMPORTANT: do not set Content-Type manually
    })

    const raw = await res.text()
    if (!res.ok) throw new Error(`Processor ${res.status}: ${raw}`)

    try {
      return JSON.parse(raw) // { modified_content, pdf_url }
    } catch {
      return { raw }
    }
  }

  function absolutize(url: string) {
    try {
      return new URL(url, PROCESS_URL).toString()
    } catch {
      return url
    }
  }

  // Generic toggle setter for UI prefs
  const toggleField =
    (key: keyof UIPreferences) =>
    (checked: boolean) => {
      setEditPrefs((prev) => ({ ...prev, [key]: checked }))
    }

  // Ensure conversation exists (your existing API usage)
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

  // ---------------------- Submit (TEXT mode) ----------------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isStreaming || !user) return

    await ensureConversation()

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: `Preset: ${preset}\n\n${inputValue}`,
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsStreaming(true)

    try {
      const resp = await postToProcessor({ preset, text: inputValue })
      const link = resp.pdf_url ? absolutize(resp.pdf_url) : null

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          `Processed text with preset **${preset}**.\n` +
          (link ? `Accessible PDF: ${link}\n` : "") +
          (resp.modified_content ? `Summary:\n${resp.modified_content}` : "No summary returned."),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Processing failed: ${err?.message ?? err}` },
      ])
      console.error(err)
    } finally {
      setIsStreaming(false)
    }
  }

  // ---------------------- File upload (FILE mode) ----------------------

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    await ensureConversation()

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: `Uploaded: ${file.name}\nPreset: ${preset}\nSending to processor…`,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    try {
      const resp = await postToProcessor({ preset, file })
      const link = resp.pdf_url ? absolutize(resp.pdf_url) : null

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          `Processed **${file.name}** with preset **${preset}**.\n` +
          (link ? `Accessible PDF: ${link}\n` : "") +
          (resp.modified_content ? `Summary:\n${resp.modified_content}` : "No summary returned."),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Processing failed: ${err?.message ?? err}` },
      ])
      console.error(err)
    } finally {
      setIsStreaming(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ---------------------- Save preferences (UI → DB) ----------------------

  const savePreferences = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = prefsToDB(editPrefs, user.id)
      const { data, error } = await supabase
        .from("user_preferences")
        .upsert(payload, { onConflict: "id" })
        .select(
          "id, has_reading_difficulty, has_motion_sensitivity, has_color_sensitivity, prefers_large_text, prefers_reduced_motion, prefers_high_contrast"
        )
        .single()

      if (error) throw error

      const uiSaved = prefsToUI(data as Partial<DBPreferences>)
      setUserPreferences(uiSaved)
      setPrefOpen(false)
    } catch (err) {
      console.error("Saving preferences failed:", err)
      // optional: toast/alert
    } finally {
      setSaving(false)
    }
  }

  // ---------------------- UI ----------------------

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
                onNewConversation={async (cid) => {
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
                Upload educational content, and I’ll help make it more accessible based on your learning preferences.
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
                  onClick={() => setPrefOpen(true)}
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
                    {userPreferences.dyslexia && <li>✓ Dyslexia enabled</li>}
                    {userPreferences.cognitive_impairment && <li>✓ Cognitive-impairment mode</li>}
                    {userPreferences.visual_impairment && <li>✓ Visual-impairment mode</li>}
                    {userPreferences.adhd && <li>✓ Large text preferred</li>}
                    {userPreferences.esl_simple_english && <li>✓ Reduced motion</li>}
                    {!Object.values(userPreferences).some(Boolean) && <li>No preferences selected yet</li>}
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
                <Label htmlFor="dyslexia">Dyslexia</Label>
                <p className="text-sm text-muted-foreground">Simplify text, add summaries & scaffolds</p>
              </div>
              <Switch
                id="dyslexia"
                checked={editPrefs.dyslexia}
                onCheckedChange={toggleField("dyslexia")}
                aria-label="Toggle Dyslexia"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="cog">Cognitive impairment</Label>
                <p className="text-sm text-muted-foreground">Chunk info; simpler structure</p>
              </div>
              <Switch
                id="cog"
                checked={editPrefs.cognitive_impairment}
                onCheckedChange={toggleField("cognitive_impairment")}
                aria-label="Toggle cognitive impairment"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="visual">Visual impairment</Label>
                <p className="text-sm text-muted-foreground">High contrast, avoid bad color pairs</p>
              </div>
              <Switch
                id="visual"
                checked={editPrefs.visual_impairment}
                onCheckedChange={toggleField("visual_impairment")}
                aria-label="Toggle visual impairment"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="adhd">Large text (ADHD)</Label>
                <p className="text-sm text-muted-foreground">Prefer larger font sizes</p>
              </div>
              <Switch
                id="adhd"
                checked={editPrefs.adhd}
                onCheckedChange={toggleField("adhd")}
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
                checked={editPrefs.esl_simple_english}
                onCheckedChange={toggleField("esl_simple_english")}
                aria-label="Toggle reduced motion"
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
