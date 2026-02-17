<template>
  <div
    class="group relative flex items-center gap-3 sm:gap-4 rounded-2xl p-4 sm:p-6 bg-[#141516] backdrop-blur-xl transition-all duration-300"
  >
    <div
      class="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-accent-500 opacity-0 group-hover:opacity-60 transition-opacity"
    />

    <div
      class="relative z-10 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-xl border border-white/10 overflow-hidden"
      :class="{ 'bg-black/40': !noPadding }"
    >
      <img
        :src="providerLogo"
        :alt="providerName"
        :class="noPadding ? 'h-full w-full object-cover' : 'h-16 w-16 object-contain'"
      />
    </div>

    <div class="relative z-10 flex flex-col gap-2 flex-1 pr-0 sm:pr-12 min-w-0">
      <div class="flex items-center justify-between">
        <h3 class="text-white font-medium wrap-break-word">
          {{ providerName }}
        </h3>

        <!-- <span
          v-if="isVerified"
          class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-400/30"
        >
          ✓ Verified
        </span> -->
      </div>

      <a
        :href="verificationUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="onCredentialClick"
        class="duration-500 ease-in-out opacity-60 group-hover:opacity-100 inline-flex items-center gap-2.5 rounded-md text-sm py-1.5 px-3 mt-2 text-white group-hover:text-white bg-transparent from-transparent to-transparent group-hover:bg-accent-800 hover:rounded-md w-fit"
      >
        <span>
          {{ ctaLabel }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16px"
          viewBox="0 -960 960 960"
          width="16px"
          fill="currentColor"
        >
          <path
            d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['credential-click'])

const props = defineProps({
  providerLogo: String,
  providerName: String,
  isVerified: Boolean,
  ctaLabel: String,
  verificationUrl: String,
  accentColor: String,
  noPadding: {
    type: Boolean,
    default: false,
  },
})

const onCredentialClick = () => {
  emit('credential-click', {
    providerName: props.providerName,
    verificationUrl: props.verificationUrl,
  })
}
</script>
