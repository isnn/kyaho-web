<script setup>
import ExperienceCredentialCard from './card/ExperienceCredentialCard.vue'
import VerifiedCredentialCard from './card/VerifiedCredentialCard.vue'
import { trackEvent } from '../service/telemetry/sentry'

const startYear = 2024
const currentYear = new Date().getFullYear()
const yearsExperience = currentYear - startYear + 1
const experienceLabel = `${yearsExperience}++ Years Experience`

const onCredentialClick = (payload) => {
  trackEvent(
    'credential_click',
    {
      location: 'credential_section',
      provider: payload?.providerName || 'unknown',
    },
    true,
  )
}

defineOptions({
  name: 'Credential',
})
</script>

<template>
  <section class="bg-[#050f07] text-white flex justify-center flex-col items-center">
    <h2 class="tracking-widest font-bold my-4 text-white text-xl">VERIFIED SKILLS</h2>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ExperienceCredentialCard
        description="Software Engineering & System Architecture"
        provider-logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg"
        :provider-name="experienceLabel"
        :years-experience="yearsExperience"
      />

      <VerifiedCredentialCard
        provider-name="Google Skills Boost"
        provider-logo="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg"
        cta-label="View Profile"
        verification-url="https://www.skills.google/public_profiles/9bcf98b6-04ee-4f4d-8d90-ae0dd64a03dc"
        accent-color="rgba(66,133,244,0.45)"
        :is-verified="true"
        @credential-click="onCredentialClick"
      />

      <VerifiedCredentialCard
        provider-name="Dicoding Academy"
        provider-logo="./assets/dicoding_logo.jpg"
        cta-label="Check Profile"
        verification-url="https://www.dicoding.com/users/isnan_firmanysah/academies"
        accent-color="rgba(16,185,129,0.45)"
        :is-verified="true"
        :no-padding="true"
        @credential-click="onCredentialClick"
      />
    </div>
  </section>
</template>
