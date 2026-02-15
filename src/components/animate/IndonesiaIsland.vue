<template>
  <div class="globe-wrapper">
    <div ref="container" class="globe"></div>

    <div class="content">
      <h2>For Developers</h2>
      <p>Built for Indonesia</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import indonesia from '@/assets/indonesia.json'

const container = ref(null)

let scene, camera, renderer, points

const radius = 2

// Convert lat/lng → 3D position
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

onMounted(() => {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    60,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)

  container.value.appendChild(renderer.domElement)

  const vertices = []

  indonesia.features.forEach((feature) => {
    const coords = feature.geometry.coordinates

    coords.forEach((polygon) => {
      polygon.forEach((coord) => {
        const [lng, lat] = coord
        const v = latLngToVector3(lat, lng, radius)
        vertices.push(v.x, v.y, v.z)
      })
    })
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  const material = new THREE.PointsMaterial({
    color: 0x3b82f6,
    size: 0.03,
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)

  animate()
})

function animate() {
  requestAnimationFrame(animate)
  points.rotation.y += 0.002
  renderer.render(scene, camera)
}
</script>

<style scoped>
.globe-wrapper {
  position: relative;
  height: 500px;
  background: #0f172a;
  overflow: hidden;
}

.globe {
  position: absolute;
  inset: 0;
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding-top: 200px;
}
</style>
