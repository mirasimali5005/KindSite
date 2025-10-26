import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark")

  return (
    <Button
      variant="ghost"
      size="icon"
      className="focus-ring relative"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle dark / light"
      onClick={() => {
        const next = !document.documentElement.classList.contains("dark")
        document.documentElement.classList.toggle("dark", next)
        try { localStorage.setItem("theme", next ? "dark" : "light") } catch {}
      }}
    >
      {/* swap icons with CSS only (no re-render flicker) */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
