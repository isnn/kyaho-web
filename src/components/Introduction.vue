<script setup>
import DotWorldMap from './animate/DotWorldMap.vue'
import { trackMetric } from '../service/telemetry/sentry'

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const headerOffset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}

const onGetStartedClick = () => {
  trackMetric('get_started_click_total', 1, { location: 'introduction_hero' })
  scrollToSection('stacks')
}
</script>

<template>
  <section
    id="about"
    class="relative overflow-hidden bg-[#050f07] text-white flex flex-col lg:flex-row items-center min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full lg:ml-[30%] h-[44vh] sm:h-[52vh] lg:h-screen">
      <DotWorldMap />
    </div>

    <div
      class="relative z-10 w-full lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 bg-[linear-gradient(to_right,rgba(5,15,7,0.98)_80%,rgba(5,15,7,0.1)_100%)] flex items-center"
    >
      <div class="w-full lg:w-1/2 text-left px-2 sm:px-8 lg:pl-24 lg:pr-8 py-8 lg:py-12">
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5">Hi,I am</h1>
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5">Isnan Firmansyah</h1>
        <p class="text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6 lg:mb-8">Fullstack Engineer</p>
        <p class="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8">
          Let's turn your dream idea into reality
        </p>
        <button
          class="bg-linear-to-r from-primary-500 to-accent-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base italic hover:opacity-60 hover:cursor-pointer transition rounded-3xl"
          @click="onGetStartedClick"
        >
          Get Started
        </button>
      </div>
    </div>
  </section>
</template>
