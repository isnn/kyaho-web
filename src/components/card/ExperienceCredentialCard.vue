<template>
  <div
    class="group relative flex items-center gap-4 rounded-2xl p-6 bg-[#141516] backdrop-blur-xl transition-all duration-300"
  >
    <div
      class="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-accent-500 opacity-0 group-hover:opacity-60 transition-opacity"
    />

    <div
      class="relative z-10 flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 overflow-hidden"
      :class="{ 'bg-black/40': !noPadding }"
    >
      <div class="relative">
        <span class="font-extrabold text-5xl"> {{ yearsExperience }}</span>
        <sup class="font-extrabold text-xl align-super">++</sup>
      </div>
    </div>

    <div class="relative z-10 flex flex-col gap-2 flex-1 pr-12">
      <div class="flex items-center justify-between">
        <h3 class="text-white font-medium">
          {{ providerName }}
        </h3>
      </div>

      <span
        class="italic max-w-48 text-wrap duration-500 ease-in-out opacity-60 flex items-center text-sm text-white"
      >
        {{ description }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  providerName: String,
  description: String,
  yearsExperience: Number,
  noPadding: {
    type: Boolean,
    default: false,
  },
})
</script>
