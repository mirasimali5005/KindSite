import { Link } from "react-router-dom"
import { GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import ScrollReveal from "@/components/ScrollReveal"

export default function Hero() {
  return (
    <section id="hero" className="container mx-auto px-4 py-16 md:py-24 text-center">
      <a href="#main-content" className="sr-only focus:not-sr-only focus-ring focus:absolute left-4 top-4 z-50 px-3 py-2 bg-primary text-primary-foreground rounded">
        Skip to main content
      </a>

      <ScrollReveal className="mx-auto max-w-3xl">
        <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden />
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
          Learn better with <span className="text-primary">Accessible</span> content
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
          Paste a link or upload a file—get a calmer, clearer, voice-friendly version tuned to your needs.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-lg"><Link to="/auth/sign-up">Start for Free</Link></Button>
          <Button asChild variant="outline" size="lg" className="text-lg"><Link to="/auth/login">Sign In</Link></Button>
        </div>
      </ScrollReveal>
    </section>
  )
}
