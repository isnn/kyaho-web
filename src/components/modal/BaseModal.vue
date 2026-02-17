<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  maxWidthClass: {
    type: String,
    default: 'max-w-2xl',
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed(() => props.modelValue)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onBackdropClick = () => {
  if (props.closeOnBackdrop) close()
}

const onEscape = (event) => {
  if (!props.closeOnEsc || !isOpen.value) return
  if (event.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

globalThis.addEventListener('keydown', onEscape)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  globalThis.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <Teleport to="body">
    <dialog
      v-if="isOpen"
      open
      class="fixed inset-0 z-100 flex h-screen w-screen items-center justify-center border-0 bg-transparent p-4"
      :aria-label="title || 'Modal'"
      @click="onBackdropClick"
    >
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        :class="[
          'relative z-10 w-full rounded-2xl border border-white/10 bg-[#101312] text-white shadow-2xl',
          maxWidthClass,
        ]"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 class="text-lg font-semibold tracking-wide">{{ title }}</h3>
          <button
            type="button"
            class="rounded-lg py-2 px-3 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
            @click="close"
          >
            ✕
          </button>
        </div>

        <div class="px-5 py-4">
          <slot />
        </div>

        <div v-if="$slots.footer" class="border-t border-white/10 px-5 py-4">
          <slot name="footer" />
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
