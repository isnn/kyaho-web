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

// ═══════════════════════════════════════════════════════════════
//  CONFIGURABLE CONSTANTS — tweak these freely
// ═══════════════════════════════════════════════════════════════
const EASE_FACTOR = 0.04 // formation / scatter lerp speed (higher = faster)
const VIBRATE_AMP = 1.2 // shake intensity in px when formed
const VIBRATE_SPEED = 4.0 // shake frequency multiplier
const DRIFT_AMP = 4.0 // idle floating range in px (scattered)
const DRIFT_SPEED = 0.8 // idle floating speed
const DOT_SPACING = 8 // grid density in px (lower = more dots)
const TWINKLE_SPEED = 1.5 // twinkle frequency
const SCATTER_RANGE = 1.3 // how far random positions spread (1 = within canvas)

// Dot sizes
const SIZE_RANDOM_MIN = 1.0
const SIZE_RANDOM_MAX = 4.0
const SIZE_MAP = 1.5

// Colors (RGB 0-1)
const COLOR_SCATTERED = [0.82, 1.0, 0.9] // light mint-white
const COLOR_LAND = [0.55, 0.95, 0.65] // bright green-mint
const COLOR_OCEAN = [0.15, 0.35, 0.22] // dim green (nearly invisible)

// World map texture — using a clean equirectangular land mask
// This is a simple black (ocean) / white (land) mask
const WORLD_MAP_URL =
  'https://raw.githubusercontent.com/turban/webgl-earth/master/images/bathymetry.jpg'

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

// Animation state
let targetProgress = 0 // 0 = scattered, 1 = formed
let currentProgress = 0

// Uniforms ref
let uniforms = null

// Land mask
let landMask = null
let landW = 0
let landH = 0

// ── Pointer events ──────────────────────────────────────────────
function onPointerEnter() {
  targetProgress = 1
}
function onPointerLeave() {
  targetProgress = 0
}

// ── Load world texture ──────────────────────────────────────────
function loadWorldTexture() {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx2 = c.getContext('2d', { willReadFrequently: true })
      ctx2.drawImage(img, 0, 0)
      const data = ctx2.getImageData(0, 0, c.width, c.height)
      landMask = data.data
      landW = c.width
      landH = c.height
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = WORLD_MAP_URL
  })
}

function isLand(nx, ny) {
  if (!landMask) return true
  const x = Math.floor(nx * (landW - 1))
  const y = Math.floor(ny * (landH - 1))
  const idx = (y * landW + x) * 4
  const r = landMask[idx]
  const g = landMask[idx + 1]
  const b = landMask[idx + 2]
  // Land is green/brown/white (brighter, more green), ocean is deep blue/dark
  // Detect land: green channel is dominant or overall brightness is high and not blue-dominant
  const brightness = (r + g + b) / 3
  const isBlue = b > r + 20 && b > g
  return brightness > 60 && !isBlue
}

// ── Build geometry ──────────────────────────────────────────────
const PAD_X = 0.06
const PAD_Y = 0.1

function buildGeometry() {
  const step = Math.max(DOT_SPACING, 4)

  // First pass — collect map positions
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

  // Attributes
  const aRandomPos = new Float32Array(count * 2)
  const aMapPos = new Float32Array(count * 2)
  const aRandomSize = new Float32Array(count)
  const aMapSize = new Float32Array(count)
  const aPhase = new Float32Array(count)
  const aIsLand = new Float32Array(count)
  // Three.js requires a position attribute
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const d = mapDots[i]

    // Random position (spread across canvas with overflow for organic feel)
    const rx = (Math.random() - 0.5) * W * SCATTER_RANGE + W / 2
    const ry = (Math.random() - 0.5) * H * SCATTER_RANGE + H / 2

    aRandomPos[i * 2] = rx
    aRandomPos[i * 2 + 1] = ry
    aMapPos[i * 2] = d.mx
    aMapPos[i * 2 + 1] = d.my

    aRandomSize[i] = SIZE_RANDOM_MIN + Math.random() * (SIZE_RANDOM_MAX - SIZE_RANDOM_MIN)
    aMapSize[i] = d.land ? SIZE_MAP : SIZE_MAP * 0.6

    aPhase[i] = Math.random() * Math.PI * 2
    aIsLand[i] = d.land ? 1.0 : 0.0

    // Dummy position (shader will override)
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

  varying float vAlpha;
  varying float vIsLand;
  varying float vProgress;

  void main() {
    // Smooth progress with cubic easing for organic feel
    float p = uProgress;
    float smoothP = p * p * (3.0 - 2.0 * p); // smoothstep-like

    // Lerp position
    vec2 pos = mix(aRandomPos, aMapPos, smoothP);

    // Idle drift when scattered
    float scattered = 1.0 - smoothP;
    pos.x += sin(uTime * uDriftSpeed + aPhase) * uDriftAmp * scattered;
    pos.y += cos(uTime * uDriftSpeed * 0.75 + aPhase * 1.3) * uDriftAmp * scattered;

    // Vibration when formed
    float vibrateIntensity = smoothstep(0.82, 1.0, p);
    pos.x += sin(uTime * uVibrateSpeed + aPhase * 2.7) * uVibrateAmp * vibrateIntensity;
    pos.y += cos(uTime * uVibrateSpeed * 0.85 + aPhase * 3.1) * uVibrateAmp * vibrateIntensity;

    // Size
    float size = mix(aRandomSize, aMapSize, smoothP);

    // Convert pixel coords to clip space (-1 to 1)
    vec2 clip = (pos / uResolution) * 2.0 - 1.0;
    clip.y *= -1.0; // flip Y

    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = size * uDpr;

    // Alpha with twinkling
    float twinkle = 0.5 + 0.5 * sin(uTime * uTwinkleSpeed + aPhase);

    float scatteredAlpha = 0.2 + twinkle * 0.3;
    float formedLandAlpha = 0.55 + twinkle * 0.4;
    float formedOceanAlpha = 0.04 + twinkle * 0.04;

    float formedAlpha = mix(formedOceanAlpha, formedLandAlpha, aIsLand);
    vAlpha = mix(scatteredAlpha, formedAlpha, smoothP);

    vIsLand = aIsLand;
    vProgress = smoothP;
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3 uColorScattered;
  uniform vec3 uColorLand;
  uniform vec3 uColorOcean;

  varying float vAlpha;
  varying float vIsLand;
  varying float vProgress;

  void main() {
    // Round dot
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft edge
    float edge = 1.0 - smoothstep(0.35, 0.5, dist);

    // Color blend
    vec3 mapColor = mix(uColorOcean, uColorLand, vIsLand);
    vec3 color = mix(uColorScattered, mapColor, vProgress);

    gl_FragColor = vec4(color, vAlpha * edge);
  }
`

// ── Init Three.js ───────────────────────────────────────────────
function initThree(geometry) {
  const el = container.value
  if (!el) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  // Scene
  scene = new THREE.Scene()

  // Orthographic camera (pixel-space, but Three requires one)
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  // Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
  renderer.setSize(W, H)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  // Uniforms
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
    uColorScattered: { value: new THREE.Vector3(...COLOR_SCATTERED) },
    uColorLand: { value: new THREE.Vector3(...COLOR_LAND) },
    uColorOcean: { value: new THREE.Vector3(...COLOR_OCEAN) },
  }

  // Material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
  })

  // Points
  pointsMesh = new THREE.Points(geometry, material)
  scene.add(pointsMesh)
}

// ── Resize ──────────────────────────────────────────────────────
async function handleResize() {
  const el = wrapper.value
  if (!el) return

  const newW = el.clientWidth
  const newH = el.clientHeight
  if (newW === W && newH === H) return

  W = newW
  H = newH

  // Rebuild everything on resize
  if (renderer) {
    renderer.dispose()
    container.value?.querySelector('canvas')?.remove()
  }

  const geometry = buildGeometry()
  if (!geometry) return

  initThree(geometry)
}

// ── Animation loop ──────────────────────────────────────────────
function animate(time) {
  animId = requestAnimationFrame(animate)

  if (!renderer || !uniforms) return

  // Lerp progress toward target
  currentProgress += (targetProgress - currentProgress) * EASE_FACTOR
  // Clamp to avoid infinite tiny movements
  if (Math.abs(currentProgress - targetProgress) < 0.001) {
    currentProgress = targetProgress
  }

  uniforms.uProgress.value = currentProgress
  uniforms.uTime.value = time * 0.001 // convert ms to seconds

  renderer.render(scene, camera)
}

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  const el = wrapper.value
  if (!el) return

  W = el.clientWidth
  H = el.clientHeight

  await loadWorldTexture()

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
