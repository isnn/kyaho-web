<script setup>
import { ref } from 'vue'
import ContactSyncModal from '@/components/contact-sync/ContactSyncModal.vue'
import { trackEvent, trackMetric } from '@/service/telemetry/sentry'

const isModalOpen = ref(false)

const openModal = () => {
  trackMetric('contact_letsync_click_total', 1, { location: 'contact_section' })
  trackEvent('contact_letsync_click', { location: 'contact_section' }, true)
  isModalOpen.value = true
}
</script>

<template>
  <section
    id="contact"
    class="bg-[#050f07] text-white pb-16 pt-18 flex flex-col justify-center items-center text-center px-4"
  >
    <h1 class="font-bold text-xl sm:text-2xl">Turning Ambitious Ideas into Reality</h1>
    <p class="font-light text-sm sm:text-base text-white/40">
      Available for remote collaborations worldwide
    </p>
    <button
      class="pointer hover:cursor-pointer hover:opacity-60 py-2 px-4 inline-flex items-center gap-2 bg-linear-to-r from-primary-500 to-accent-500 mt-5 rounded-md text-shadow-md font-bold"
      @click="openModal"
    >
      Let’s Sync
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <ContactSyncModal v-model="isModalOpen" />
  </section>
</template>
