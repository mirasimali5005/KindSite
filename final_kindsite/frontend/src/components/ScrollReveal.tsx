import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Wrap any block you want to reveal on scroll.
 * Respects prefers-reduced-motion automatically via your global CSS.
 */
export default function ScrollReveal({
  as: As = "div",
  className,
  children,
  threshold = 0.08,
}: {
  as?: any
  className?: string
  children: React.ReactNode
  threshold?: number
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add("reveal")
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("show")),
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return (
    <As ref={ref} className={cn("reveal", className)}>
      {children}
    </As>
  )
}
