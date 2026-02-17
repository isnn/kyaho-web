<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const isOpen = ref(false)

const selectedLabel = computed(() => props.modelValue || 'Select an option')

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const selectOption = (option) => {
  emit('update:modelValue', option)
  close()
}

const onGlobalClick = (event) => {
  if (!root.value) return
  if (!root.value.contains(event.target)) close()
}

const onGlobalKeydown = (event) => {
  if (event.key === 'Escape') close()
}

globalThis.addEventListener('click', onGlobalClick)
globalThis.addEventListener('keydown', onGlobalKeydown)

onBeforeUnmount(() => {
  globalThis.removeEventListener('click', onGlobalClick)
  globalThis.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <div ref="root" class="relative w-full">
    <button
      type="button"
      class="flex w-full items-center justify-between rounded-md border border-white/15 bg-[#0b0f0d] px-3 py-2 text-left text-sm text-white outline-none transition hover:border-white/30 focus:border-primary-500"
      @click="toggle"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <svg
        class="h-4 w-4 shrink-0 text-white/70 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-[#101312] py-1 shadow-xl"
    >
      <button
        v-for="option in props.options"
        :key="option"
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-white/90 transition hover:bg-primary-500/20 hover:text-white"
        :class="props.modelValue === option ? 'bg-primary-500/15 text-white' : ''"
        @click="selectOption(option)"
      >
        <span>{{ option }}</span>
        <!-- <span v-if="props.modelValue === option" class="text-primary-400">●</span> -->
      </button>
    </div>
  </div>
</template>
