"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Loader2, Send, Upload, LogOut, Settings, Eye } from "lucide-react"

export default function ChatPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState("")
  const router = useRouter()

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    body: { sessionId },
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      // Get user preferences
      const { data: prefs } = await supabase.from("user_preferences").select("*").eq("id", user.id).single()

      setUserPreferences(prefs)
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "in_progress") return

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      const fileData = base64.split(",")[1]

      sendMessage({
        text: `I've uploaded a file: ${file.name}. Please make it more accessible based on my preferences.`,
        experimental_attachments: [
          {
            name: file.name,
            contentType: file.type,
            url: base64,
          },
        ],
      })
    }
    reader.readAsDataURL(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    )
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
              <Button variant="ghost" size="icon" onClick={() => router.push("/preferences")} aria-label="Settings">
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
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return <div key={index}>{part.text}</div>
                    }
                    return null
                  })}
                </div>
              </Card>
            </div>
          ))}

          {status === "in_progress" && (
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
              disabled={status === "in_progress"}
              aria-label="Upload file"
            >
              <Upload className="h-5 w-5" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe what you need help with..."
              disabled={status === "in_progress"}
              className="flex-1"
              aria-label="Message input"
            />
            <Button type="submit" disabled={status === "in_progress" || !inputValue.trim()} aria-label="Send message">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  )
}
