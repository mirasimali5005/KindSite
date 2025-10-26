"use client"

import { useState, useRef, type FormEvent } from "react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Loader2, Send, Upload, BookOpen, Edit3, Download } from "lucide-react"
import { ThemeToggle } from "../components/ThemeToggle"

type Preset = "dyslexia" | "cognitive_impairment" | "visual_impairment" | "adhd" | "esl_simple_english"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  pdfHref?: string
}

// Proxy path. Do NOT use the full Render origin in the browser.
const API_URL = "/process"

// Keep links same-origin so the proxy serves /downloads/*
const toProxiedUrl = (u?: string | null) => (u || "").startsWith("/downloads/") ? u! : (u || "")

type UIPreferences = {
  dyslexia: boolean
  cognitive_impairment: boolean
  visual_impairment: boolean
  adhd: boolean
  esl_simple_english: boolean
}

const DEFAULT_PREFS: UIPreferences = {
  dyslexia: false,
  cognitive_impairment: true,
  visual_impairment: false,
  adhd: false,
  esl_simple_english: false,
}

function pickPreset(p: UIPreferences): Preset {
  if (p.cognitive_impairment) return "cognitive_impairment"
  if (p.dyslexia) return "dyslexia"
  if (p.visual_impairment) return "visual_impairment"
  if (p.adhd) return "adhd"
  if (p.esl_simple_english) return "esl_simple_english"
  return "cognitive_impairment"
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [busy, setBusy] = useState(false)

  const [userPrefs, setUserPrefs] = useState<UIPreferences>(DEFAULT_PREFS)
  const [editPrefs, setEditPrefs] = useState<UIPreferences>(DEFAULT_PREFS)
  const [prefOpen, setPrefOpen] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preset: Preset = pickPreset(userPrefs)

  const push = (m: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), ...m }])
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 40)
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
    push({ role: "user", content: `Preset: ${preset}\n\n${text}` })
    setBusy(true)

    try {
      const fd = new FormData()
      fd.append("text_input", text)
      fd.append("accessibility_preset", preset)
      const data = await callAPI(fd)
      const pdf = toProxiedUrl(data.pdf_url)
      push({
        role: "assistant",
        content:
          (pdf ? "PDF ready.\n" : "No PDF returned.\n") +
          (data.modified_content ? `\nSummary:\n${data.modified_content}` : ""),
        pdfHref: pdf || undefined,
      })
    } catch (e: any) {
      push({ role: "assistant", content: `Error: ${e.message || e}` })
    } finally {
      setBusy(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || busy) return

    push({ role: "user", content: `Uploaded: ${file.name}\nPreset: ${preset}` })
    setBusy(true)

    try {
      const fd = new FormData()
      fd.append("file_input", file, file.name)
      fd.append("accessibility_preset", preset)
      const data = await callAPI(fd)
      const pdf = toProxiedUrl(data.pdf_url)
      push({
        role: "assistant",
        content:
          (pdf ? "PDF ready.\n" : "No PDF returned.\n") +
          (data.modified_content ? `\nSummary:\n${data.modified_content}` : ""),
        pdfHref: pdf || undefined,
      })
    } catch (e: any) {
      push({ role: "assistant", content: `Error: ${e.message || e}` })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const toggle =
    (k: keyof UIPreferences) =>
    (checked: boolean) =>
      setEditPrefs((p) => ({ ...p, [k]: checked }))

  const savePrefs = () => {
    setUserPrefs(editPrefs)
    setPrefOpen(false)
  }

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
          <nav aria-label="Main">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setEditPrefs(userPrefs)
                  setPrefOpen(true)
                }}
              >
                <Edit3 className="h-4 w-4" />
                Edit preferences
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center animate-fade-in-up border-primary/20">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to LearnAccess
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Upload a PDF or paste text. I’ll call the processor using your selected preference and return a downloadable PDF.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/50 p-4 text-left transition-all hover:border-primary/50 hover:shadow-md">
                  <h3 className="font-semibold text-foreground">Current preset</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{preset}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditPrefs(userPrefs)
                    setPrefOpen(true)
                  }}
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
                    {userPrefs.dyslexia && <li>✓ Dyslexia</li>}
                    {userPrefs.cognitive_impairment && <li>✓ Cognitive impairment</li>}
                    {userPrefs.visual_impairment && <li>✓ Visual impairment</li>}
                    {userPrefs.adhd && <li>✓ ADHD-friendly text</li>}
                    {userPrefs.esl_simple_english && <li>✓ Simple English (ESL)</li>}
                    {!Object.values(userPrefs).some(Boolean) && <li>No preferences selected</li>}
                  </ul>
                </button>
              </div>
            </Card>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <Card
                className={`max-w-[80%] p-4 transition-all hover:shadow-lg ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-primary to-accent text-white border-primary/50"
                    : "bg-card border-border/50"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

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

      {/* Preferences Dialog (local state only) */}
      <Dialog open={prefOpen} onOpenChange={setPrefOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit learning & accessibility preferences</DialogTitle>
          </DialogHeader>

        <div className="space-y-4 py-2">
          <PrefRow id="dyslexia" label="Dyslexia" desc="Simplify text, add summaries & scaffolds"
            checked={editPrefs.dyslexia} onChange={(v)=>setEditPrefs(p=>({...p,dyslexia:v}))}/>
          <PrefRow id="cog" label="Cognitive impairment" desc="Chunk info, simpler structure"
            checked={editPrefs.cognitive_impairment} onChange={(v)=>setEditPrefs(p=>({...p,cognitive_impairment:v}))}/>
          <PrefRow id="visual" label="Visual impairment" desc="High contrast, avoid bad color pairs"
            checked={editPrefs.visual_impairment} onChange={(v)=>setEditPrefs(p=>({...p,visual_impairment:v}))}/>
          <PrefRow id="adhd" label="ADHD" desc="ADHD-friendly text"
            checked={editPrefs.adhd} onChange={(v)=>setEditPrefs(p=>({...p,adhd:v}))}/>
          <PrefRow id="reducedMotion" label="Simple English (ESL)" desc="Simplifies complex language."
            checked={editPrefs.esl_simple_english} onChange={(v)=>setEditPrefs(p=>({...p,esl_simple_english:v}))}/>
        </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPrefOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePrefs}>Save preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PrefRow(props: {
  id: string
  label: string
  desc: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const { id, label, desc, checked, onChange } = props
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}