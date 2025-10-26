"use client"

import { useState, useRef, type FormEvent } from "react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Loader2, Send, Upload, Download } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  pdfHref?: string
}

// IMPORTANT: use the proxy path, not the full Render URL
const API_URL = "/process"

// Keep links same-origin so the proxy also serves /downloads/*
const toProxiedUrl = (u?: string | null) => (u || "").startsWith("/downloads/") ? u! : (u || "")

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const push = (m: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), ...m }])
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  async function callAPI(fd: FormData) {
    const r = await fetch(API_URL, { method: "POST", body: fd })
    if (!r.ok) throw new Error(`API ${r.status}`)
    return r.json() as Promise<{ modified_content?: string; pdf_url?: string }>
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!inputValue.trim() || busy) return
    const text = inputValue.trim()
    setInputValue("")
    push({ role: "user", content: text })
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("text_input", text)
      fd.append("accessibility_preset", "cognitive_impairment")
      const data = await callAPI(fd)
      const pdf = toProxiedUrl(data.pdf_url)
      push({ role: "assistant", content: pdf ? "PDF ready." : "No PDF returned.", pdfHref: pdf || undefined })
    } catch (e: any) {
      push({ role: "assistant", content: `Error: ${e.message || e}` })
    } finally {
      setBusy(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || busy) return
    push({ role: "user", content: `Uploaded: ${file.name}` })
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("file_input", file, file.name)
      fd.append("accessibility_preset", "cognitive_impairment")
      const data = await callAPI(fd)
      const pdf = toProxiedUrl(data.pdf_url)
      push({ role: "assistant", content: pdf ? "PDF ready." : "No PDF returned.", pdfHref: pdf || undefined })
    } catch (e: any) {
      push({ role: "assistant", content: `Error: ${e.message || e}` })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  // Guaranteed PDF download: click an <a download> that points to the proxied /downloads/... path.
  function DownloadButton({ href }: { href: string }) {
    return (
      <Button
        asChild
        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
      >
        <a href={href} download target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4 mr-2" />
          Download Accessible PDF
        </a>
      </Button>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-lg p-4 text-center text-lg font-semibold">
        LearnAccess Chat
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[80%] p-4 ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "bg-card border-border"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.pdfHref && (
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                    <DownloadButton href={m.pdfHref} />
                    <a
                      href={m.pdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline text-green-600"
                    >
                      Open in new tab
                    </a>
                  </div>
                )}
              </Card>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Processing…</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card/80 backdrop-blur-lg p-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-3xl flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf"
            onChange={handleFile}
            className="hidden"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload className="h-5 w-5" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type text to convert…"
            disabled={busy}
            className="flex-1"
          />
          <Button type="submit" disabled={busy || !inputValue.trim()} className="bg-gradient-to-r from-primary to-accent">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}
