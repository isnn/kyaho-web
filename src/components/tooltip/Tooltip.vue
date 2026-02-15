<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'top',
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v),
  },
  delay: {
    type: Number,
    default: 0,
  },
})

const isVisible = ref(false)
let timeout = null

const show = () => {
  if (props.delay) {
    timeout = setTimeout(() => {
      isVisible.value = true
    }, props.delay)
  } else {
    isVisible.value = true
  }
}

const hide = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  isVisible.value = false
}

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout)
})

const positionClasses = computed(() => {
  switch (props.position) {
    case 'bottom':
      return 'top-full mt-2 origin-top'
    case 'left':
      return 'right-full mr-2 origin-right'
    case 'right':
      return 'left-full ml-2 origin-left'
    default:
      return 'bottom-full mb-2 origin-bottom'
  }
})

const motionClasses = computed(() => {
  return isVisible.value
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 translate-y-1 scale-95'
})
</script>

<template>
  <span
    class="relative inline-flex"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />

    <div
      v-show="isVisible"
      class="absolute z-50 pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      :class="[
        positionClasses,
        motionClasses,
        position === 'top' || position === 'bottom'
          ? 'left-1/2 -translate-x-1/2'
          : 'top-1/2 -translate-y-1/2',
      ]"
    >
      <div
        class="relative rounded-lg border border-white/10 bg-[#141516]/95 backdrop-blur-md px-3 py-1.5 text-xs text-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.6)] whitespace-nowrap"
      >
        {{ content }}

        <span
          class="absolute h-2 w-2 rotate-45 bg-[#141516]/95 border border-white/10"
          :class="{
            'left-1/2 -bottom-1 -translate-x-1/2 border-t-0 border-l-0': position === 'top',
            'left-1/2 -top-1 -translate-x-1/2 border-b-0 border-r-0': position === 'bottom',
            'top-1/2 -right-1 -translate-y-1/2 border-t-0 border-r-0': position === 'left',
            'top-1/2 -left-1 -translate-y-1/2 border-b-0 border-l-0': position === 'right',
          }"
        />
      </div>
    </div>
  </span>
</template>
