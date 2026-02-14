<template>
  <div
    ref="container"
    class="world-wrapper"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <canvas ref="canvas" class="world-canvas" />
    <div class="world-glow" aria-hidden="true" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const container = ref(null)
const canvas = ref(null)

let ctx = null
let rafId = 0
let resizeObserver = null

const dots = []
let width = 0
let height = 0
let dpr = 1
let reducedMotion = false

const pointer = {
  x: 0,
  y: 0,
  active: false,
}

function onPointerMove(event) {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return

  pointer.x = event.clientX - rect.left
  pointer.y = event.clientY - rect.top
  pointer.active = true
}

function onPointerLeave() {
  pointer.active = false
}

function worldMask(nx, ny) {
  const x = nx * 2 - 1
  const y = ny * 2 - 1

  const oval = (x * x) / (0.98 * 0.98) + (y * y) / (0.66 * 0.66) <= 1
  if (!oval) return false

  const masses = [
    [-0.74, -0.02, 0.2, 1.2],
    [-0.62, 0.18, 0.16, 0.9],
    [-0.52, -0.2, 0.13, 0.7],
    [-0.18, 0.02, 0.21, 1.1],
    [0.02, -0.08, 0.18, 1.0],
    [0.3, -0.02, 0.22, 1.3],
    [0.46, 0.17, 0.14, 0.8],
    [0.53, -0.18, 0.13, 0.75],
    [0.7, 0.02, 0.19, 1.0],
    [0.82, 0.15, 0.13, 0.7],
  ]

  let field = 0
  for (let i = 0; i < masses.length; i += 1) {
    const [mx, my, spread, weight] = masses[i]
    const dx = x - mx
    const dy = y - my
    field += weight * Math.exp(-(dx * dx + dy * dy) / (spread * spread))
  }

  const waves = 0.24 * Math.sin((x + 1.1) * 10.0) + 0.18 * Math.cos((y - 0.2) * 13.0)
  return field + waves > 0.95
}

function rebuildDots() {
  dots.length = 0

  const targetDensity = width > 900 ? 10 : width > 640 ? 11 : 13
  const step = Math.max(targetDensity, 8)

  for (let y = step * 0.5; y < height; y += step) {
    for (let x = step * 0.5; x < width; x += step) {
      const nx = x / width
      const ny = y / height
      if (!worldMask(nx, ny)) continue

      dots.push({
        ox: x,
        oy: y,
        x,
        y,
        vx: 0,
        vy: 0,
        size: 0.7 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }
}

function setupCanvasSize() {
  const el = container.value
  const cvs = canvas.value
  if (!el || !cvs) return

  width = el.clientWidth
  height = el.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)

  cvs.width = Math.floor(width * dpr)
  cvs.height = Math.floor(height * dpr)
  cvs.style.width = `${width}px`
  cvs.style.height = `${height}px`

  ctx = cvs.getContext('2d')
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  rebuildDots()
}

function drawFrame(time) {
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)

  const radius = Math.max(140, width * 0.24)
  const strength = reducedMotion ? 0.02 : 0.1
  const spring = reducedMotion ? 0.025 : 0.04
  const drag = reducedMotion ? 0.88 : 0.83

  const gx = pointer.active ? (pointer.x / width - 0.5) * 2 : 0
  const gy = pointer.active ? (pointer.y / height - 0.5) * 2 : 0

  for (let i = 0; i < dots.length; i += 1) {
    const dot = dots[i]

    let fx = 0
    let fy = 0

    if (pointer.active) {
      const dx = dot.x - pointer.x
      const dy = dot.y - pointer.y
      const dist = Math.hypot(dx, dy) || 1

      if (dist < radius) {
        const n = 1 - dist / radius
        const force = n * n * strength
        fx += (dx / dist) * force
        fy += (dy / dist) * force
      }

      fx += -gx * 0.01
      fy += -gy * 0.01
    }

    fx += (dot.ox - dot.x) * spring
    fy += (dot.oy - dot.y) * spring

    dot.vx = (dot.vx + fx) * drag
    dot.vy = (dot.vy + fy) * drag

    dot.x += dot.vx
    dot.y += dot.vy

    const twinkle = 0.45 + 0.55 * Math.sin(time * 0.0017 + dot.phase)
    const dxh = pointer.x - dot.x
    const dyh = pointer.y - dot.y
    const near = pointer.active ? Math.max(0, 1 - Math.hypot(dxh, dyh) / radius) : 0

    const baseA = 0.35 + twinkle * 0.35
    const accentA = near * 0.45

    ctx.beginPath()
    ctx.arc(dot.x, dot.y, dot.size + near * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(204, 255, 236, ${Math.min(baseA + accentA, 0.95)})`
    ctx.fill()
  }

  rafId = window.requestAnimationFrame(drawFrame)
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  setupCanvasSize()

  resizeObserver = new ResizeObserver(() => {
    setupCanvasSize()
  })

  if (container.value) {
    resizeObserver.observe(container.value)
  }

  rafId = window.requestAnimationFrame(drawFrame)
})

onBeforeUnmount(() => {
  if (rafId) window.cancelAnimationFrame(rafId)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
.world-wrapper {
  position: relative;
  width: min(46vw, 560px);
  height: min(30vw, 350px);
  min-width: 310px;
  min-height: 220px;
  border-radius: 1.25rem;
  overflow: hidden;
  background:
    radial-gradient(140% 90% at 100% 0%, rgba(165, 243, 252, 0.09), transparent 55%),
    radial-gradient(130% 90% at 0% 100%, rgba(187, 247, 208, 0.1), transparent 52%), #050f07;
  border: 1px solid rgba(220, 252, 231, 0.08);
}

.world-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.world-glow {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 50%, rgba(187, 247, 208, 0.08), transparent 56%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 34%);
}

@media (max-width: 1024px) {
  .world-wrapper {
    width: min(88vw, 540px);
    height: min(54vw, 320px);
    margin-top: 2rem;
  }
}
</style>
