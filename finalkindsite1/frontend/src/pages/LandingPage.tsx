import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { FileText, ImageIcon, Sparkles, BookOpen, GraduationCap, Users, Upload, Send, Download } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { ThemeToggle } from "../components/ThemeToggle"
import { processText, processFile, normalizePdfUrl } from "../lib/accessibility"

export default function LandingPage() {
  // --- lightweight “try it now” state (same API as Chat) ---
  const [demoText, setDemoText] = useState("")
  const [busy, setBusy] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const PRESET = "cognitive_impairment" // or swap from saved prefs later

  async function onDemoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!demoText.trim() || busy) return
    setBusy(true)
    setResultMsg(null)
    setResultUrl(null)
    try {
      const r = await processText(demoText.trim(), PRESET)
      const pdf = normalizePdfUrl(r.pdf_url || "")
      setResultUrl(pdf || null)
      setResultMsg(r.modified_content || (pdf ? "PDF ready." : "No summary returned."))
    } catch (err: any) {
      setResultMsg(`Error: ${err?.message ?? err}`)
    } finally {
      setBusy(false)
    }
  }

  async function onDemoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f || busy) return
    setBusy(true)
    setResultMsg(null)
    setResultUrl(null)
    try {
      const r = await processFile(f, PRESET)
      const pdf = normalizePdfUrl(r.pdf_url || "")
      setResultUrl(pdf || null)
      setResultMsg(r.modified_content || (pdf ? "PDF ready." : "No summary returned."))
    } catch (err: any) {
      setResultMsg(`Error: ${err?.message ?? err}`)
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>

      <header
        className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg transition-all"
        role="banner"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
              <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LearnAccess
            </span>
          </div>
          <nav aria-label="Main navigation">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="ghost" className="hover:bg-primary/10 transition-colors">
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105"
              >
                <Link to="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main">
        <section className="container mx-auto px-4 py-16 md:py-24 animate-fade-in-up" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in delay-100">
                <GraduationCap className="h-4 w-4" />
                <span>AI-Powered Learning Platform</span>
              </div>
              <h1
                id="hero-heading"
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance animate-fade-in-up delay-200"
              >
                Make Learning{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Accessible
                </span>{" "}
                for Everyone
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty animate-fade-in-up delay-300">
                Transform educational content into accessible formats tailored to your learning style. Whether you have
                dyslexia, cognitive impairment, or other accessibility needs, we empower every learner.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in-up delay-400">
                <Button
                  asChild
                  size="lg"
                  className="text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 hover:shadow-lg"
                >
                  <Link to="/auth/sign-up">Start Learning Free</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg bg-transparent hover:bg-primary/10 transition-all hover:scale-105"
                >
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>

            {/* --- Quick demo panel (same API as Chat) --- */}
            <Card className="mt-10 p-6 md:p-8 border-primary/20">
              <h3 className="text-xl font-semibold mb-3">Try it now</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paste a sentence/paragraph or upload a PDF/image— we’ll convert it using your chosen preset
                (<code>cognitive_impairment</code> by default).
              </p>

              <form onSubmit={onDemoSubmit} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    placeholder="Type a small sample text…"
                    disabled={busy}
                    aria-label="Sample text to process"
                  />
                  <Button
                    type="submit"
                    disabled={busy || !demoText.trim()}
                    className="bg-gradient-to-r from-primary to-accent"
                    aria-label="Submit sample text"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Process
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf"
                    className="hidden"
                    onChange={onDemoFile}
                    aria-label="Upload file for processing"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    aria-label="Upload file"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload a file
                  </Button>
                  {busy && <span className="text-sm text-muted-foreground">Processing…</span>}
                </div>

                {(resultMsg || resultUrl) && (
                  <div className="mt-2 rounded-lg bg-muted/50 p-3 border border-border/50">
                    {resultMsg && <p className="text-sm mb-2 whitespace-pre-wrap">{resultMsg}</p>}
                    {resultUrl && (
                      <div className="flex items-center gap-3">
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                          <a href={resultUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download Accessible PDF
                          </a>
                        </Button>
                        <a
                          href={resultUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline text-green-700"
                        >
                          Open in new tab
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-center text-3xl font-bold text-foreground mb-12 animate-fade-in-up">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="p-6 text-center transition-all hover:scale-105 hover:shadow-xl hover:border-primary/50 animate-fade-in-up delay-100">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4 transition-transform group-hover:scale-110">
                <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload PDFs, images, or any educational material that's hard to read or navigate.
              </p>
            </Card>

            <Card className="p-6 text-center transition-all hover:scale-105 hover:shadow-xl hover:border-primary/50 animate-fade-in-up delay-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">AI Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes and transforms content based on your learning preferences and accessibility needs.
              </p>
            </Card>

            <Card className="p-6 text-center transition-all hover:scale-105 hover:shadow-xl hover:border-primary/50 animate-fade-in-up delay-300">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                <ImageIcon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Learn Your Way</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive content optimized for your specific needs - clearer, simpler, and easier to understand.
              </p>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16" aria-labelledby="benefits-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="benefits-heading" className="text-center text-3xl font-bold text-foreground mb-12">
              Built for Every Learner
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 transition-all hover:shadow-lg hover:border-primary/50">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Inclusive Design</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Designed with input from educators and accessibility experts to support diverse learning needs.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 transition-all hover:shadow-lg hover:border-primary/50">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-3">
                    <GraduationCap className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Evidence-Based</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our methods are backed by research in cognitive science and accessibility best practices.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16" aria-labelledby="cta-heading">
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20 transition-all hover:shadow-2xl">
            <h2 id="cta-heading" className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Join thousands of learners who are experiencing education the way it should be—accessible, engaging, and
              personalized.
            </p>
            <Button
              asChild
              size="lg"
              className="text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 hover:shadow-lg"
            >
              <Link to="/auth/sign-up">Get Started Now</Link>
            </Button>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-16" role="contentinfo">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
                <BookOpen className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LearnAccess
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 LearnAccess. Making education accessible for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
