<template>
  <div
    ref="wrapper"
    class="relative w-full h-full overflow-hidden"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <canvas ref="canvas" class="absolute inset-0 w-full h-full" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ─── Configuration ──────────────────────────────────────────────
const DOT_SPACING = 8 // px between dots (lower = denser)
const DOT_RADIUS = 1.3
const DOT_COLOR_LAND = [65, 190, 90] // primary-500 ish green
const DOT_COLOR_OCEAN = [20, 60, 35] // dim dark-green for ocean dots
const DOT_COLOR_HOVER = [180, 255, 210] // bright hover color
const ARC_COLOR = [65, 167, 190] // accent-500 cyan
const BG_COLOR = '#050f07'
const HOVER_RADIUS = 120 // px radius of hover glow
const TWINKLE_SPEED = 0.0015

// Marker locations [lat, lng, label]
const MARKERS = [
  [-6.2, 106.85], // Jakarta
  [1.35, 103.82], // Singapore
  [35.68, 139.65], // Tokyo
  [37.77, -122.42], // San Francisco
  [51.51, -0.13], // London
  [48.86, 2.35], // Paris
  [-33.87, 151.21], // Sydney
]

// Arc connections [fromIndex, toIndex]
const ARCS = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [3, 4],
  [4, 5],
  [2, 6],
]

// ─── Refs ───────────────────────────────────────────────────────
const wrapper = ref(null)
const canvas = ref(null)

let ctx = null
let rafId = 0
let resizeObs = null
let dpr = 1
let W = 0
let H = 0
let dots = []
let landMask = null
let landCanvas = null
let landCtx = null
let worldImg = null
let worldLoaded = false

const pointer = { x: -9999, y: -9999, active: false }

// ─── Pointer ────────────────────────────────────────────────────
function onPointerMove(e) {
  const r = canvas.value?.getBoundingClientRect()
  if (!r) return
  pointer.x = e.clientX - r.left
  pointer.y = e.clientY - r.top
  pointer.active = true
}
function onPointerLeave() {
  pointer.active = false
}

// ─── World map texture (Natural Earth style) ────────────────────
// We load a 1-bit land/ocean mask image to determine which dots are land.
// Using a high-contrast equirectangular world map PNG.
const WORLD_MAP_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/1280px-World_map_blank_without_borders.svg.png'

function loadWorldTexture() {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      worldImg = img
      // Draw to offscreen canvas for pixel sampling
      landCanvas = document.createElement('canvas')
      landCanvas.width = img.naturalWidth
      landCanvas.height = img.naturalHeight
      landCtx = landCanvas.getContext('2d', { willReadFrequently: true })
      landCtx.drawImage(img, 0, 0)
      landMask = landCtx.getImageData(0, 0, landCanvas.width, landCanvas.height)
      worldLoaded = true
      resolve()
    }
    img.onerror = () => {
      // Fallback: all dots are "land"
      worldLoaded = false
      resolve()
    }
    img.src = WORLD_MAP_URL
  })
}

function isLand(nx, ny) {
  if (!worldLoaded || !landMask) return true
  const x = Math.floor(nx * (landMask.width - 1))
  const y = Math.floor(ny * (landMask.height - 1))
  const idx = (y * landMask.width + x) * 4
  // The SVG map has dark land (#000 or near) on white ocean
  // Detect: if pixel is dark → land
  const r = landMask.data[idx]
  const g = landMask.data[idx + 1]
  const b = landMask.data[idx + 2]
  const a = landMask.data[idx + 3]
  // Land pixels: dark or colored (low brightness), ocean: white/transparent
  if (a < 128) return false // transparent = ocean
  const brightness = (r + g + b) / 3
  return brightness < 160
}

// ─── Lat/Lng to canvas position ─────────────────────────────────
// Equirectangular projection with padding
const PAD_X = 0.04
const PAD_Y = 0.08

function latlngToCanvas(lat, lng) {
  // lng: -180..180 → 0..1, lat: 90..-90 → 0..1
  const nx = (lng + 180) / 360
  const ny = (90 - lat) / 180
  const x = (PAD_X + nx * (1 - 2 * PAD_X)) * W
  const y = (PAD_Y + ny * (1 - 2 * PAD_Y)) * H
  return [x, y]
}

// ─── Build dots ─────────────────────────────────────────────────
function buildDots() {
  dots = []
  const step = Math.max(DOT_SPACING, 5)

  for (let py = step / 2; py < H; py += step) {
    // Offset every other row for sunflower-hex pattern (like Stripe)
    const row = Math.floor(py / step)
    const offsetX = row % 2 === 0 ? 0 : step / 2
    for (let px = step / 2 + offsetX; px < W; px += step) {
      // Normalized position in canvas
      const nx = (px / W - PAD_X) / (1 - 2 * PAD_X)
      const ny = (py / H - PAD_Y) / (1 - 2 * PAD_Y)

      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) continue

      const land = isLand(nx, ny)

      dots.push({
        x: px,
        y: py,
        ox: px,
        oy: py,
        land,
        phase: Math.random() * Math.PI * 2,
        size: DOT_RADIUS + (land ? Math.random() * 0.5 : 0),
      })
    }
  }
}

// ─── Arcs ───────────────────────────────────────────────────────
function getArcPoints(from, to, segments = 40) {
  const [x1, y1] = from
  const [x2, y2] = to
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy)
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  // Arc height proportional to distance
  const arcH = dist * 0.25
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = x1 + dx * t
    const yBase = y1 + dy * t
    // Parabolic arc
    const arc = -4 * arcH * t * (t - 1)
    pts.push([x, yBase - arc])
  }
  return pts
}

// ─── Resize ─────────────────────────────────────────────────────
function resize() {
  const el = wrapper.value
  const cvs = canvas.value
  if (!el || !cvs) return

  W = el.clientWidth
  H = el.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)

  cvs.width = Math.floor(W * dpr)
  cvs.height = Math.floor(H * dpr)
  cvs.style.width = `${W}px`
  cvs.style.height = `${H}px`

  ctx = cvs.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  buildDots()
}

// ─── Render ─────────────────────────────────────────────────────
function drawFrame(time) {
  if (!ctx) {
    rafId = requestAnimationFrame(drawFrame)
    return
  }

  ctx.clearRect(0, 0, W, H)

  // ── Draw dots ──
  const hx = pointer.x
  const hy = pointer.y
  const hActive = pointer.active
  const hRad = HOVER_RADIUS
  const hRadSq = hRad * hRad

  for (let i = 0; i < dots.length; i++) {
    const d = dots[i]

    // Twinkling
    const twinkle = 0.5 + 0.5 * Math.sin(time * TWINKLE_SPEED + d.phase)

    // Distance to pointer
    let nearness = 0
    if (hActive) {
      const ddx = d.ox - hx
      const ddy = d.oy - hy
      const distSq = ddx * ddx + ddy * ddy
      if (distSq < hRadSq) {
        nearness = 1 - Math.sqrt(distSq) / hRad
      }
    }

    // Color
    let r, g, b
    if (d.land) {
      r = DOT_COLOR_LAND[0] + (DOT_COLOR_HOVER[0] - DOT_COLOR_LAND[0]) * nearness
      g = DOT_COLOR_LAND[1] + (DOT_COLOR_HOVER[1] - DOT_COLOR_LAND[1]) * nearness
      b = DOT_COLOR_LAND[2] + (DOT_COLOR_HOVER[2] - DOT_COLOR_LAND[2]) * nearness
    } else {
      r = DOT_COLOR_OCEAN[0] + (DOT_COLOR_HOVER[0] - DOT_COLOR_OCEAN[0]) * nearness * 0.4
      g = DOT_COLOR_OCEAN[1] + (DOT_COLOR_HOVER[1] - DOT_COLOR_OCEAN[1]) * nearness * 0.4
      b = DOT_COLOR_OCEAN[2] + (DOT_COLOR_HOVER[2] - DOT_COLOR_OCEAN[2]) * nearness * 0.4
    }

    // Opacity
    const baseAlpha = d.land ? 0.3 + twinkle * 0.55 : 0.08 + twinkle * 0.07
    const alpha = Math.min(baseAlpha + nearness * 0.5, 1)

    // Size boost on hover
    const sz = d.size + nearness * 1.2

    ctx.beginPath()
    ctx.arc(d.ox, d.oy, sz, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(3)})`
    ctx.fill()
  }

  // ── Draw arcs ──
  const arcProgress = (time * 0.0003) % 1 // 0→1 loop
  for (let a = 0; a < ARCS.length; a++) {
    const [fi, ti] = ARCS[a]
    const from = latlngToCanvas(MARKERS[fi][0], MARKERS[fi][1])
    const to = latlngToCanvas(MARKERS[ti][0], MARKERS[ti][1])
    const pts = getArcPoints(from, to, 50)

    // Offset phase per arc for staggered animation
    const phase = (arcProgress + a * 0.12) % 1
    const headPos = Math.floor(phase * pts.length)
    const tailLen = Math.floor(pts.length * 0.4)

    ctx.lineWidth = 1.2
    ctx.lineCap = 'round'

    for (let i = 1; i < pts.length; i++) {
      // Calculate segment visibility based on traveling head
      const distFromHead = headPos - i
      if (distFromHead < 0 || distFromHead > tailLen) continue

      const segAlpha = 1 - distFromHead / tailLen
      ctx.beginPath()
      ctx.moveTo(pts[i - 1][0], pts[i - 1][1])
      ctx.lineTo(pts[i][0], pts[i][1])
      ctx.strokeStyle = `rgba(${ARC_COLOR[0]},${ARC_COLOR[1]},${ARC_COLOR[2]},${(segAlpha * 0.7).toFixed(3)})`
      ctx.stroke()
    }
  }

  // ── Draw markers (pulsing discs) ──
  const pulse = 0.6 + 0.4 * Math.sin(time * 0.003)
  for (let m = 0; m < MARKERS.length; m++) {
    const [lat, lng] = MARKERS[m]
    const [mx, my] = latlngToCanvas(lat, lng)

    // Outer glow
    ctx.beginPath()
    ctx.arc(mx, my, 5 + pulse * 3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${ARC_COLOR[0]},${ARC_COLOR[1]},${ARC_COLOR[2]},${(0.12 * pulse).toFixed(3)})`
    ctx.fill()

    // Inner dot
    ctx.beginPath()
    ctx.arc(mx, my, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${ARC_COLOR[0]},${ARC_COLOR[1]},${ARC_COLOR[2]},0.9)`
    ctx.fill()
  }

  // ── Vignette / diffuse lighting gradient ──
  const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.15, W / 2, H / 2, W * 0.6)
  grad.addColorStop(0, 'rgba(5,15,7,0)')
  grad.addColorStop(1, 'rgba(5,15,7,0.65)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  rafId = requestAnimationFrame(drawFrame)
}

// ─── Lifecycle ──────────────────────────────────────────────────
onMounted(async () => {
  await loadWorldTexture()
  resize()

  resizeObs = new ResizeObserver(() => resize())
  if (wrapper.value) resizeObs.observe(wrapper.value)

  rafId = requestAnimationFrame(drawFrame)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (resizeObs) resizeObs.disconnect()
})
</script>
