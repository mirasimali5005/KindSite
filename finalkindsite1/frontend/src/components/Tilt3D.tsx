"use client"

import { type ReactNode, useRef, type MouseEvent, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  maxTilt?: number
  scale?: number
  glare?: boolean
  disabled?: boolean
} & HTMLAttributes<HTMLDivElement>

export function Tilt3D({
  children,
  className,
  maxTilt = 10,
  scale = 1.02,
  glare = true,
  disabled = false,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const cx = r.width / 2
    const cy = r.height / 2
    const rotX = ((y - cy) / cy) * -maxTilt
    const rotY = ((x - cx) / cx) * maxTilt
    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`
    el.style.setProperty("--mx", `${x}px`)
    el.style.setProperty("--my", `${y}px`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`
  }

  return (
    <div className="tilt-parent">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cn(
          "tilt-3d rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl",
          "transition-transform duration-200 will-change-transform",
          className
        )}
        {...rest}
      >
        {glare && <div aria-hidden className="tilt-glare" />}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
