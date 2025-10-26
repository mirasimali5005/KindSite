import { Link, useLocation } from "react-router-dom"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ThemeToggle"

export default function Header() {
  const { pathname } = useLocation()
  const onAuth = pathname.startsWith("/auth")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 focus-ring">
          <Eye className="h-5 w-5 text-primary" aria-hidden />
          <span className="text-lg font-semibold">AccessibleNow</span>
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">beta</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
          <ThemeToggle />
          {!onAuth && (
            <>
              <Button asChild variant="ghost"><Link to="/auth/login">Sign in</Link></Button>
              <Button asChild><Link to="/auth/sign-up">Get started</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
