import { useEffect } from "react"

// Optional: put small UI effects that don't need backend
export function useInteractiveEffects() {
  useEffect(() => {
    // Example: subtle fade-in animation on page load
    document.body.classList.add("animate-fade-in")
    return () => document.body.classList.remove("animate-fade-in")
  }, [])
}
