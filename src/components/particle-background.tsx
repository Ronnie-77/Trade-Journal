'use client'

import * as React from 'react'

/**
 * Particle network / constellation background — cloned from the
 * KnownTrader.in home page aesthetic.
 *
 * Renders a full-bleed `<canvas>` behind the page content with:
 *   - N slowly-drifting particles (dots)
 *   - Thin lines connecting particles within a proximity threshold
 *   - Line opacity fades with distance
 *   - Subtle mouse parallax (particles near the cursor brighten)
 *
 * Colors auto-adapt to the theme:
 *   - dark mode  → soft white particles on near-black
 *   - light mode → soft dark particles on light
 *
 * Performance: caps particle count on mobile, pauses when tab is hidden,
 * uses a single rAF loop.
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

interface Props {
  /** particle count — auto-scaled down on small screens */
  density?: number
  /** max distance (px) between two particles for a line to be drawn */
  linkDistance?: number
  /** particle dot radius (px) */
  particleRadius?: number
  /** base opacity for particles (0–1) */
  particleOpacity?: number
  /** max opacity for connection lines (0–1) */
  lineOpacity?: number
  /** drift speed multiplier */
  speed?: number
  className?: string
}

export function ParticleBackground({
  density = 80,
  linkDistance = 130,
  particleRadius = 1.6,
  particleOpacity = 0.55,
  lineOpacity = 0.35,
  speed = 0.35,
  className,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rafRef = React.useRef<number>(0)
  const particlesRef = React.useRef<Particle[]>([])
  const mouseRef = React.useRef<{ x: number; y: number } | null>(null)
  const visibleRef = React.useRef(true)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    // Read the theme's foreground color so particles adapt (white in dark,
    // dark in light). Falls back to a neutral gray.
    function getColors() {
      const fg = getComputedStyle(document.documentElement)
        .getPropertyValue('--foreground')
        .trim()
      // Parse "oklch(L C H)" or "#hex" — we just need to know if it's light
      // or dark mode. Check .dark class on <html>.
      const isDark = document.documentElement.classList.contains('dark')
      const particleColor = isDark
        ? 'rgba(255, 255, 255, ALPHA)'
        : 'rgba(20, 22, 28, ALPHA)'
      return { particleColor, isDark }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas!.clientWidth
      height = canvas!.clientHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles()
    }

    function initParticles() {
      // Scale down particle count on small screens for performance
      const area = width * height
      const baseArea = 1280 * 800
      const scale = Math.min(1, area / baseArea)
      const count = Math.max(20, Math.round(density * scale))
      const arr: Particle[] = []
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          r: particleRadius * (0.7 + Math.random() * 0.6),
        })
      }
      particlesRef.current = arr
    }

    function step() {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      const particles = particlesRef.current
      const { particleColor } = getColors()
      const mouse = mouseRef.current

      ctx!.clearRect(0, 0, width, height)

      // Update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        // Wrap around edges
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * lineOpacity
            ctx!.beginPath()
            ctx!.strokeStyle = particleColor.replace('ALPHA', alpha.toFixed(3))
            ctx!.lineWidth = 0.6
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        // Mouse proximity boost
        let opacity = particleOpacity
        let radius = p.r
        if (mouse) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const boost = 1 - dist / 120
            opacity = Math.min(1, particleOpacity + boost * 0.4)
            radius = p.r * (1 + boost * 0.8)
          }
        }
        ctx!.beginPath()
        ctx!.fillStyle = particleColor.replace('ALPHA', opacity.toFixed(3))
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(step)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    function onMouseLeave() {
      mouseRef.current = null
    }
    function onVisibility() {
      visibleRef.current = !document.hidden
    }

    resize()
    step()

    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density, linkDistance, particleRadius, particleOpacity, lineOpacity, speed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
