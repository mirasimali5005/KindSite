import { Link } from "react-router-dom"
import { Eye, FileText, ImageIcon, Sparkles } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border bg-card" role="banner">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-semibold text-foreground">AccessibleNow</span>
          </div>
          <nav aria-label="Main navigation">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance"
            >
              Make Any Content <span className="text-primary">Accessible</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              Transform PDFs, images, and documents into accessible formats tailored to your needs. Whether you have
              dyslexia, motion sensitivity, or other accessibility requirements, we've got you covered.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth/sign-up">Start for Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg bg-transparent">
                <Link to="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-center text-3xl font-bold text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload PDFs, images, or any document that's hard to read or navigate.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">AI Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes and transforms content based on your accessibility preferences.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <ImageIcon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Get Accessible Version</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive content optimized for your specific needs - clearer, simpler, and easier to understand.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16" aria-labelledby="cta-heading">
          <Card className="p-8 md:p-12 text-center bg-primary/5 border-primary/20">
            <h2 id="cta-heading" className="text-3xl font-bold text-foreground mb-4">
              Ready to Make Content Accessible?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Join us today and experience content the way it should be - accessible to everyone.
            </p>
            <Button asChild size="lg" className="text-lg">
              <Link to="/auth/sign-up">Get Started Now</Link>
            </Button>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16" role="contentinfo">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AccessibleNow. Making the web accessible for everyone.</p>
        </div>
      </footer>
    </div>
  )
}
