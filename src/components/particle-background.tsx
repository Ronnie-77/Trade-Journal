'use client'

import * as React from 'react'

/**
 * Advanced particle network / constellation background.
 *
 * Features:
 *   - N slowly-drifting particles (dots) that wrap around edges
 *   - Thin lines connecting particles within a proximity threshold
 *   - Mouse-interactive: cursor connects to nearby particles with lines
 *   - Particles near the cursor brighten and grow slightly
 *   - Subtle repulsion (gentle, slow) from cursor
 *   - Colors auto-adapt to the theme
 *   - No solid cursor dot — only glow ring + connection lines
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  baseR: number
}

interface Props {
  density?: number
  linkDistance?: number
  mouseLinkDistance?: number
  particleRadius?: number
  particleOpacity?: number
  lineOpacity?: number
  mouseLineOpacity?: number
  speed?: number
  repulsionRadius?: number
  repulsionStrength?: number
  className?: string
}

export function ParticleBackground({
  density = 120,
  linkDistance = 130,
  mouseLinkDistance = 160,
  particleRadius = 2,
  particleOpacity = 0.6,
  lineOpacity = 0.4,
  mouseLineOpacity = 0.55,
  speed = 0.35,
  repulsionRadius = 90,
  repulsionStrength = 0.06,
  className,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rafRef = React.useRef<number>(0)
  const particlesRef = React.useRef<Particle[]>([])
  const mouseRef = React.useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })
  const visibleRef = React.useRef(true)
  const pulseRef = React.useRef(0)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    function getColors() {
      const isDark = document.documentElement.classList.contains('dark')
      const particleColor = isDark
        ? 'rgba(255, 255, 255, ALPHA)'
        : 'rgba(20, 22, 28, ALPHA)'
      const accentColor = isDark
        ? 'rgba(255, 157, 46, ALPHA)'
        : 'rgba(255, 130, 20, ALPHA)'
      return { particleColor, accentColor, isDark }
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
      const area = width * height
      const baseArea = 1280 * 800
      const scale = Math.min(1, area / baseArea)
      const count = Math.max(20, Math.round(density * scale))
      const arr: Particle[] = []
      for (let i = 0; i < count; i++) {
        const r = particleRadius * (0.7 + Math.random() * 0.6)
        arr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          r,
          baseR: r,
        })
      }
      particlesRef.current = arr
    }

    function step() {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(step)
        return
      }

      pulseRef.current += 0.03
      const particles = particlesRef.current
      const { particleColor, accentColor } = getColors()
      const mouse = mouseRef.current

      ctx!.clearRect(0, 0, width, height)

      // Update positions + apply gentle mouse repulsion
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        // Gentle mouse repulsion — only affects nearby particles
        let nearMouse = false
        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < repulsionRadius && dist > 0) {
            nearMouse = true
            const force = (1 - dist / repulsionRadius) * repulsionStrength
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
        }

        // Only damp particles near mouse (so they calm down after push).
        // Particles far from mouse keep their natural drift speed.
        if (nearMouse) {
          p.vx *= 0.95
          p.vy *= 0.95
        }

        // Maintain natural minimum drift speed (keeps particles moving)
        const v = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (v < speed * 0.3) {
          p.vx += (Math.random() - 0.5) * speed * 0.1
          p.vy += (Math.random() - 0.5) * speed * 0.1
        }
        // Cap max speed only for mouse-pushed particles
        if (nearMouse) {
          const maxV = speed * 1.8
          if (v > maxV) {
            p.vx = (p.vx / v) * maxV
            p.vy = (p.vy / v) * maxV
          }
        }

        // Wrap around edges
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // Smoothly reset radius toward base
        p.r += (p.baseR - p.r) * 0.1
      }

      // Draw particle-to-particle connection lines (thicker)
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
            ctx!.lineWidth = 0.9
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      // Draw mouse-to-particle connection lines (accent color, thicker)
      if (mouse.active) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouseLinkDistance) {
            const alpha = (1 - dist / mouseLinkDistance) * mouseLineOpacity
            ctx!.beginPath()
            ctx!.strokeStyle = accentColor.replace('ALPHA', alpha.toFixed(3))
            ctx!.lineWidth = 1.1
            ctx!.moveTo(mouse.x, mouse.y)
            ctx!.lineTo(p.x, p.y)
            ctx!.stroke()
          }
        }
      }

      // Draw particles (thicker dots)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        let opacity = particleOpacity
        let radius = p.r

        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const boost = 1 - dist / 120
            opacity = Math.min(1, particleOpacity + boost * 0.4)
            radius = p.baseR * (1 + boost * 0.8)
          }
        }

        ctx!.beginPath()
        ctx!.fillStyle = particleColor.replace('ALPHA', opacity.toFixed(3))
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Draw mouse cursor glow only (NO solid center dot)
      if (mouse.active) {
        const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5
        const glowR = 10 + pulse * 5

        // Radial glow (fading outward)
        const grad = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowR * 2.5)
        grad.addColorStop(0, accentColor.replace('ALPHA', '0.2'))
        grad.addColorStop(0.4, accentColor.replace('ALPHA', '0.06'))
        grad.addColorStop(1, accentColor.replace('ALPHA', '0'))
        ctx!.beginPath()
        ctx!.fillStyle = grad
        ctx!.arc(mouse.x, mouse.y, glowR * 2.5, 0, Math.PI * 2)
        ctx!.fill()

        // Pulsing ring (subtle)
        ctx!.beginPath()
        ctx!.strokeStyle = accentColor.replace('ALPHA', (0.25 + pulse * 0.15).toFixed(3))
        ctx!.lineWidth = 1.5
        ctx!.arc(mouse.x, mouse.y, glowR, 0, Math.PI * 2)
        ctx!.stroke()
      }

      rafRef.current = requestAnimationFrame(step)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      }
    }
    function onMouseLeave() {
      mouseRef.current = { ...mouseRef.current, active: false }
    }
    function onVisibility() {
      visibleRef.current = !document.hidden
    }

    resize()
    step()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density, linkDistance, mouseLinkDistance, particleRadius, particleOpacity, lineOpacity, mouseLineOpacity, speed, repulsionRadius, repulsionStrength])

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
