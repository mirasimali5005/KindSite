import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Eye, FileText, Palette, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-semibold text-foreground">AccessibleNow</span>
          </div>
          <nav aria-label="Main navigation">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-foreground text-balance md:text-5xl lg:text-6xl"
            >
              Make Any Content Accessible for Everyone
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              Transform PDFs, images, and documents into accessible formats tailored for people with dyslexia, motion
              sensitivity, and other accessibility needs.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/auth/sign-up">Start Converting Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted py-16 md:py-24" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <h2
              id="features-heading"
              className="text-center text-3xl font-bold text-foreground text-balance md:text-4xl"
            >
              Built with Accessibility in Mind
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground leading-relaxed">
              Our AI-powered tool adapts content to your specific needs, ensuring everyone can access information
              comfortably.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-lg bg-primary/10 p-3" aria-hidden="true">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Dyslexia</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Optimized text formatting for dyslexia and dyslexia with adjustable fonts and spacing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-lg bg-primary/10 p-3" aria-hidden="true">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Motion Control</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Reduced motion interfaces for users sensitive to animations and movement.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-lg bg-primary/10 p-3" aria-hidden="true">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Screen Reader Ready</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Fully compatible with screen readers and assistive technologies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-16 md:py-24" aria-labelledby="how-it-works-heading">
          <div className="mx-auto max-w-3xl">
            <h2
              id="how-it-works-heading"
              className="text-center text-3xl font-bold text-foreground text-balance md:text-4xl"
            >
              Simple, Personalized Process
            </h2>
            <div className="mt-12 space-y-8">
              <div className="flex gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold"
                  aria-hidden="true"
                >
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Create Your Account</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    Sign up and tell us about your accessibility needs and preferences.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold"
                  aria-hidden="true"
                >
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Upload Your Content</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    Share PDFs, images, or documents that you need help accessing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold"
                  aria-hidden="true"
                >
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Get Accessible Versions</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    Receive optimized content tailored to your specific accessibility requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 md:py-24" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-heading" className="text-3xl font-bold text-primary-foreground text-balance md:text-4xl">
              Ready to Make Content Accessible?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90 leading-relaxed">
              Join us in creating a more inclusive digital world where everyone can access information comfortably.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 text-base">
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AccessibleNow. Making the web accessible for everyone.</p>
        </div>
      </footer>
    </div>
  )
}
