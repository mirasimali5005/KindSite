import { Link } from "react-router-dom"
import { FileText, ImageIcon, Sparkles, BookOpen, GraduationCap, Users } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { ThemeToggle } from "../components/ThemeToggle"

export default function LandingPage() {
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
          <div className="mx-auto max-w-3xl text-center">
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
              dyslexia, motion sensitivity, or other accessibility needs, we empower every learner.
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
              Join thousands of learners who are experiencing education the way it should be - accessible, engaging, and
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
