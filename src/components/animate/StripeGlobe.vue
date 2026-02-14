<template>
  <div ref="wrapper" class="relative w-full h-full flex items-center justify-center">
    <canvas
      ref="canvasRef"
      class="w-full h-full max-w-145 max-h-145 aspect-square cursor-grab active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointerout="onPointerOut"
      @mousemove="onMouseMove"
      @touchmove.passive="onTouchMove"
    />
    <!-- Subtle glow overlay -->
    <div
      class="pointer-events-none absolute inset-0 rounded-full opacity-40"
      style="
        background: radial-gradient(
          circle at 50% 50%,
          rgba(65, 190, 90, 0.12) 0%,
          rgba(65, 167, 190, 0.06) 40%,
          transparent 70%
        );
      "
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import createGlobe from 'cobe'

const canvasRef = ref(null)
const wrapper = ref(null)
let globe = null
let pointerInteracting = null
let pointerInteractionMovement = 0
let phiRef = 0
let widthRef = 0

const getSize = () => {
  if (!wrapper.value) return 500
  return Math.min(wrapper.value.clientWidth, wrapper.value.clientHeight, 580)
}

const onPointerDown = (e) => {
  pointerInteracting = e.clientX - pointerInteractionMovement
  if (canvasRef.value) canvasRef.value.style.cursor = 'grabbing'
}

const onPointerUp = () => {
  pointerInteracting = null
  if (canvasRef.value) canvasRef.value.style.cursor = 'grab'
}

const onPointerOut = () => {
  pointerInteracting = null
  if (canvasRef.value) canvasRef.value.style.cursor = 'grab'
}

const onMouseMove = (e) => {
  if (pointerInteracting !== null) {
    const delta = e.clientX - pointerInteracting
    pointerInteractionMovement = delta
  }
}

const onTouchMove = (e) => {
  if (pointerInteracting !== null && e.touches[0]) {
    const delta = e.touches[0].clientX - pointerInteracting
    pointerInteractionMovement = delta
  }
}

const onWindowResize = () => {
  widthRef = getSize()
}

onMounted(() => {
  if (!canvasRef.value) return

  widthRef = getSize()

  // Theme colors normalized to 0-1
  // primary-500: #41be5a → [0.255, 0.745, 0.353]
  // accent-500:  #41a7be → [0.255, 0.655, 0.745]
  // bg:          #050f07

  globe = createGlobe(canvasRef.value, {
    devicePixelRatio: Math.min(window.devicePixelRatio, 2),
    width: widthRef * 2,
    height: widthRef * 2,
    phi: 0,
    theta: 0.25,
    dark: 1,
    diffuse: 3,
    mapSamples: 24000,
    mapBrightness: 2.5,
    mapBaseBrightness: 0.05,
    baseColor: [0.15, 0.4, 0.22], // dark green matching #050f07 theme
    markerColor: [0.255, 0.745, 0.353], // primary-500
    glowColor: [0.06, 0.18, 0.1], // subtle dark green glow
    markers: [
      // Jakarta, Indonesia
      { location: [-6.2088, 106.8456], size: 0.06 },
      // Singapore
      { location: [1.3521, 103.8198], size: 0.04 },
      // Tokyo
      { location: [35.6762, 139.6503], size: 0.04 },
      // San Francisco
      { location: [37.7749, -122.4194], size: 0.04 },
      // London
      { location: [51.5074, -0.1278], size: 0.04 },
    ],
    opacity: 0.85,
    onRender: (state) => {
      // Continuous auto-rotation + drag interaction
      if (pointerInteracting === null) {
        phiRef += 0.003
      }
      state.phi = phiRef + pointerInteractionMovement / 200

      // Responsive sizing
      if (widthRef) {
        state.width = widthRef * 2
        state.height = widthRef * 2
      }
    },
  })

  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  if (globe) globe.destroy()
  window.removeEventListener('resize', onWindowResize)
})
</script>
