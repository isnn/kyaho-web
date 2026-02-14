<template>
  <div
    ref="wrapper"
    class="relative w-full h-full overflow-hidden"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <div ref="container" class="absolute inset-0" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import landGeoJSON from '@/assets/ne_110m_land.geojson'

// ═══════════════════════════════════════════════════════════════
//  CONFIGURABLE CONSTANTS
// ═══════════════════════════════════════════════════════════════

// ── Transition ──────────────────────────────────────────────────
const EASE_FACTOR = 0.02 // Speed of transition between states (0–1, lower = slower)

// ── After hover (map formed) ────────────────────────────────────
const DOT_SPACING = 10 // Pixel spacing between dots in the map grid
const SIZE_MAP = 3 // Dot size when formed into map
const VIBRATE_AMP = 1.2 // Vibration amplitude (px) when map is formed
const VIBRATE_SPEED = 4.0 // Vibration speed multiplier when formed

// ── Before hover (scattered) ────────────────────────────────────
const SIZE_RANDOM_MIN = 4 // Min dot size when scattered
const SIZE_RANDOM_MAX = 4 // Max dot size when scattered
const SCATTERED_ALPHA_MIN = 0.9 // Min opacity when scattered (base)
const SCATTERED_ALPHA_MAX = 0.9 // Max opacity when scattered (base + twinkle)
const SCATTERED_VISIBLE_PCT = 0.05 // Fraction of dots visible when scattered (0–1, e.g. 0.4 = 40%)
const DRIFT_AMP = 4.0 // Drift amplitude (px) for idle floating
const DRIFT_SPEED = 0.6 // Drift speed multiplier
const SCATTER_RANGE = 10 // Scatter spread factor

// ── Shared ──────────────────────────────────────────────────────
const TWINKLE_SPEED = 1 // Twinkle animation speed
const EDGE_PAD = 0.1 // Edge padding ratio (0–0.5) to keep dots inside bounds

// ── Colors (RGB 0–1) ────────────────────────────────────────────
const DOT_COLOR = [0.55, 0.95, 0.65] // Dot color when scattered
const COLOR_LAND = [0.55, 0.95, 0.65] // Land dot color when formed
const COLOR_OCEAN = [0.15, 0.35, 0.22] // Ocean dot color when formed

// ═══════════════════════════════════════════════════════════════
//  Internals
// ═══════════════════════════════════════════════════════════════
const wrapper = ref(null)
const container = ref(null)

let renderer, scene, camera, pointsMesh
let animId = 0
let resizeObs = null

let W = 0
let H = 0

let targetProgress = 0
let currentProgress = 0
let uniforms = null

let landMaskData = null
const MASK_W = 1440
const MASK_H = 720

// ── Pointer events ──────────────────────────────────────────────
function onPointerEnter() {
  targetProgress = 1
}
function onPointerLeave() {
  targetProgress = 0
}

// ── Generate land mask from Natural Earth GeoJSON ──────────────
function lngLatToPixel(lng, lat) {
  return [((lng + 180) / 360) * MASK_W, ((90 - lat) / 180) * MASK_H]
}

function drawRing(ctx, ring) {
  ctx.beginPath()
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = lngLatToPixel(ring[i][0], ring[i][1])
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

function drawGeometry(ctx, geometry) {
  if (geometry.type === 'Polygon') {
    // First ring is the exterior, subsequent rings are holes
    // For a land mask we just fill the exterior
    for (const ring of geometry.coordinates) {
      drawRing(ctx, ring)
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        drawRing(ctx, ring)
      }
    }
  }
}

function generateLandMask() {
  const c = document.createElement('canvas')
  c.width = MASK_W
  c.height = MASK_H
  const ctx = c.getContext('2d', { willReadFrequently: true })

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, MASK_W, MASK_H)

  ctx.fillStyle = '#fff'
  for (const feature of landGeoJSON.features) {
    drawGeometry(ctx, feature.geometry)
  }

  const data = ctx.getImageData(0, 0, MASK_W, MASK_H)
  landMaskData = data.data
}

function isLand(nx, ny) {
  if (!landMaskData) return false
  const x = Math.floor(nx * (MASK_W - 1))
  const y = Math.floor(ny * (MASK_H - 1))
  const idx = (y * MASK_W + x) * 4
  return landMaskData[idx] > 128
}

// ── Build geometry ──────────────────────────────────────────────
const PAD_X = 0.06
const PAD_Y = 0.1

function buildGeometry() {
  const step = Math.max(DOT_SPACING, 4)

  const mapDots = []
  for (let py = step / 2; py < H; py += step) {
    const row = Math.floor(py / step)
    const ox = row % 2 === 0 ? 0 : step / 2
    for (let px = step / 2 + ox; px < W; px += step) {
      const nx = (px / W - PAD_X) / (1 - 2 * PAD_X)
      const ny = (py / H - PAD_Y) / (1 - 2 * PAD_Y)
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) continue

      const land = isLand(nx, ny)
      mapDots.push({ mx: px, my: py, land })
    }
  }

  const count = mapDots.length
  if (count === 0) return null

  // Padded bounds so scattered dots stay well inside the container
  const padX = W * EDGE_PAD
  const padY = H * EDGE_PAD
  const innerW = W - 2 * padX
  const innerH = H - 2 * padY

  const aRandomPos = new Float32Array(count * 2)
  const aMapPos = new Float32Array(count * 2)
  const aRandomSize = new Float32Array(count)
  const aMapSize = new Float32Array(count)
  const aPhase = new Float32Array(count)
  const aIsLand = new Float32Array(count)
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const d = mapDots[i]

    // Scatter within padded bounds so dots never touch the edges
    const rx = padX + Math.random() * innerW
    const ry = padY + Math.random() * innerH

    aRandomPos[i * 2] = rx
    aRandomPos[i * 2 + 1] = ry
    aMapPos[i * 2] = d.mx
    aMapPos[i * 2 + 1] = d.my

    aRandomSize[i] = SIZE_RANDOM_MIN + Math.random() * (SIZE_RANDOM_MAX - SIZE_RANDOM_MIN)
    aMapSize[i] = d.land ? SIZE_MAP : SIZE_MAP * 0.6

    aPhase[i] = Math.random() * Math.PI * 2
    aIsLand[i] = d.land ? 1.0 : 0.0

    positions[i * 3] = 0
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = 0
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aRandomPos', new THREE.Float32BufferAttribute(aRandomPos, 2))
  geometry.setAttribute('aMapPos', new THREE.Float32BufferAttribute(aMapPos, 2))
  geometry.setAttribute('aRandomSize', new THREE.Float32BufferAttribute(aRandomSize, 1))
  geometry.setAttribute('aMapSize', new THREE.Float32BufferAttribute(aMapSize, 1))
  geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(aPhase, 1))
  geometry.setAttribute('aIsLand', new THREE.Float32BufferAttribute(aIsLand, 1))

  return geometry
}

// ── Shaders ─────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
  attribute vec2 aRandomPos;
  attribute vec2 aMapPos;
  attribute float aRandomSize;
  attribute float aMapSize;
  attribute float aPhase;
  attribute float aIsLand;

  uniform float uProgress;
  uniform float uTime;
  uniform float uVibrateAmp;
  uniform float uVibrateSpeed;
  uniform float uDriftAmp;
  uniform float uDriftSpeed;
  uniform float uTwinkleSpeed;
  uniform vec2 uResolution;
  uniform float uDpr;
  uniform float uEdgePad;
  uniform float uScatteredAlphaMin;
  uniform float uScatteredAlphaMax;
  uniform float uScatteredVisiblePct;

  varying float vAlpha;
  varying float vIsLand;
  varying float vProgress;

  void main() {
    float p = uProgress;
    float smoothP = p * p * (3.0 - 2.0 * p);

    vec2 pos = mix(aRandomPos, aMapPos, smoothP);

    // Idle drift when scattered
    float scattered = 1.0 - smoothP;
    pos.x += sin(uTime * uDriftSpeed + aPhase) * uDriftAmp * scattered;
    pos.y += cos(uTime * uDriftSpeed * 0.75 + aPhase * 1.3) * uDriftAmp * scattered;

    // Vibration when formed
    float vibrateIntensity = smoothstep(0.82, 1.0, p);
    pos.x += sin(uTime * uVibrateSpeed + aPhase * 2.7) * uVibrateAmp * vibrateIntensity;
    pos.y += cos(uTime * uVibrateSpeed * 0.85 + aPhase * 3.1) * uVibrateAmp * vibrateIntensity;

    float size = mix(aRandomSize, aMapSize, smoothP);

    vec2 clip = (pos / uResolution) * 2.0 - 1.0;
    clip.y *= -1.0;

    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = size * uDpr;

    float twinkle = 0.5 + 0.5 * sin(uTime * uTwinkleSpeed + aPhase);

    // Scattered alpha from configurable range
    float scatteredAlpha = mix(uScatteredAlphaMin, uScatteredAlphaMax, twinkle);

    // Only show a percentage of dots when scattered (use aPhase as per-dot random)
    float dotRand = aPhase / (2.0 * 3.14159265);
    float visible = step(dotRand, uScatteredVisiblePct);
    scatteredAlpha *= visible;

    float formedLandAlpha = 0.55 + twinkle * 0.4;
    float formedOceanAlpha = 0.04 + twinkle * 0.04;

    float formedAlpha = mix(formedOceanAlpha, formedLandAlpha, aIsLand);
    float baseAlpha = mix(scatteredAlpha, formedAlpha, smoothP);

    // Smooth edge fade — dots near container edges fade out smoothly
    vec2 nPos = pos / uResolution;
    float fadeZone = uEdgePad * 1.5;
    float edgeL = smoothstep(0.0, fadeZone, nPos.x);
    float edgeR = smoothstep(0.0, fadeZone, 1.0 - nPos.x);
    float edgeT = smoothstep(0.0, fadeZone, nPos.y);
    float edgeB = smoothstep(0.0, fadeZone, 1.0 - nPos.y);
    float edgeFade = edgeL * edgeR * edgeT * edgeB;

    vAlpha = baseAlpha * edgeFade;

    vIsLand = aIsLand;
    vProgress = smoothP;
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3 uDotColor;
  uniform vec3 uColorLand;
  uniform vec3 uColorOcean;

  varying float vAlpha;
  varying float vIsLand;
  varying float vProgress;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float edge = 1.0 - smoothstep(0.35, 0.5, dist);

    vec3 mapColor = mix(uColorOcean, uColorLand, vIsLand);
    vec3 color = mix(uDotColor, mapColor, vProgress);

    gl_FragColor = vec4(color, vAlpha * edge);
  }
`

// ── Init Three.js ───────────────────────────────────────────────
function initThree(geometry) {
  const el = container.value
  if (!el) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
  renderer.setSize(W, H)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  uniforms = {
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uVibrateAmp: { value: VIBRATE_AMP },
    uVibrateSpeed: { value: VIBRATE_SPEED },
    uDriftAmp: { value: DRIFT_AMP },
    uDriftSpeed: { value: DRIFT_SPEED },
    uTwinkleSpeed: { value: TWINKLE_SPEED },
    uResolution: { value: new THREE.Vector2(W, H) },
    uDpr: { value: dpr },
    uEdgePad: { value: EDGE_PAD },
    uScatteredAlphaMin: { value: SCATTERED_ALPHA_MIN },
    uScatteredAlphaMax: { value: SCATTERED_ALPHA_MAX },
    uScatteredVisiblePct: { value: SCATTERED_VISIBLE_PCT },
    uDotColor: { value: new THREE.Vector3(...DOT_COLOR) },
    uColorLand: { value: new THREE.Vector3(...COLOR_LAND) },
    uColorOcean: { value: new THREE.Vector3(...COLOR_OCEAN) },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
  })

  pointsMesh = new THREE.Points(geometry, material)
  scene.add(pointsMesh)
}

// ── Resize ──────────────────────────────────────────────────────
function handleResize() {
  const el = wrapper.value
  if (!el) return

  const newW = el.clientWidth
  const newH = el.clientHeight
  if (newW === W && newH === H) return

  W = newW
  H = newH

  if (renderer) {
    renderer.dispose()
    container.value?.querySelector('canvas')?.remove()
  }

  if (pointsMesh) {
    pointsMesh.geometry.dispose()
    pointsMesh = null
  }
  if (scene) {
    scene.clear()
  }

  const geometry = buildGeometry()
  if (!geometry) return

  initThree(geometry)
}

// ── Animation loop ──────────────────────────────────────────────
function animate(time) {
  animId = requestAnimationFrame(animate)

  if (!renderer || !uniforms) return

  currentProgress += (targetProgress - currentProgress) * EASE_FACTOR
  if (Math.abs(currentProgress - targetProgress) < 0.001) {
    currentProgress = targetProgress
  }

  uniforms.uProgress.value = currentProgress
  uniforms.uTime.value = time * 0.001

  renderer.render(scene, camera)
}

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(() => {
  const el = wrapper.value
  if (!el) return

  W = el.clientWidth
  H = el.clientHeight

  generateLandMask()

  const geometry = buildGeometry()
  if (!geometry) return

  initThree(geometry)

  resizeObs = new ResizeObserver(() => handleResize())
  resizeObs.observe(el)

  animId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
  if (resizeObs) resizeObs.disconnect()
  if (renderer) renderer.dispose()
})
</script>
