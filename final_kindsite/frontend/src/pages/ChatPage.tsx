"use client"

import type React from "react"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Loader2, Send, Upload, LogOut, Settings, Eye } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return

      try {
        const { data } = await supabase.from("user_preferences").select("*").eq("id", user.id).single()

        setUserPreferences(data)
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
          })),
          sessionId,
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
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6))

              if (data.type === "text") {
                assistantMessage.content += data.content
                setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
              } else if (data.type === "done") {
                break
              } else if (data.type === "error") {
                console.error("Stream error:", data.error)
              }
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
            sessionId,
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
              if (line.startsWith("data: ")) {
                const data = JSON.parse(line.slice(6))

                if (data.type === "text") {
                  assistantMessage.content += data.content
                  setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
                } else if (data.type === "done") {
                  break
                }
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

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-semibold text-foreground">AccessibleNow</span>
          </div>
          <nav aria-label="User navigation">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate("/preferences")} aria-label="Settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4" role="main" aria-label="Chat messages">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Welcome to AccessibleNow</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Upload a PDF, image, or document, and I'll help make it more accessible based on your preferences.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/50 p-4 text-left">
                  <h3 className="font-semibold text-foreground">Try asking:</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>"Make this PDF easier to read"</li>
                    <li>"Convert this image to accessible text"</li>
                    <li>"Simplify this document"</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-4 text-left">
                  <h3 className="font-semibold text-foreground">Your preferences:</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {userPreferences?.has_reading_difficulty && <li>Reading support enabled</li>}
                    {userPreferences?.has_motion_sensitivity && <li>Motion sensitivity mode</li>}
                    {userPreferences?.has_color_sensitivity && <li>Color sensitivity mode</li>}
                    {userPreferences?.prefers_large_text && <li>Large text preferred</li>}
                    {userPreferences?.prefers_reduced_motion && <li>Reduced motion</li>}
                    {userPreferences?.prefers_high_contrast && <li>High contrast mode</li>}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              role="article"
              aria-label={`${message.role === "user" ? "Your" : "Assistant"} message`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
              </Card>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start" role="status" aria-live="polite">
              <Card className="max-w-[80%] p-4 bg-card">
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

      {/* Input Area */}
      <footer className="border-t border-border bg-card p-4">
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
            >
              <Upload className="h-5 w-5" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe what you need help with..."
              disabled={isStreaming}
              className="flex-1"
              aria-label="Message input"
            />
            <Button type="submit" disabled={isStreaming || !inputValue.trim()} aria-label="Send message">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  )
}
