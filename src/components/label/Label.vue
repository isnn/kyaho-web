<template>
  <span :class="labelClasses">
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { twMerge } from 'tailwind-merge'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    required: true,
    validator: (value) => ['appType', 'role', 'impact'].includes(value),
  },
  color: {
    type: String,
    default: '',
    validator: (value) => ['', 'emerald', 'amber', 'cyan', 'rose', 'violet'].includes(value),
  },
  class: {
    type: String,
    default: '',
  },
})

const variantClasses = {
  appType: 'bg-violet-500/15 text-violet-400 border-violet-400/30',
  role: 'bg-white/5 text-white/70 border-white/10',
  impact:
    'bg-primary-500/15 text-primary-400 border-primary-400/30 shadow-[0_0_10px_var(--primary-600)] shadow-primary-500/35',
}

const colorClasses = {
  emerald:
    'bg-emerald-500/15 text-emerald-400 border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
  amber:
    'bg-amber-500/15 text-amber-400 border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.25)]',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.25)]',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-400/30 shadow-[0_0_10px_rgba(251,113,133,0.25)]',
  violet:
    'bg-violet-500/15 text-violet-400 border-violet-400/30 shadow-[0_0_10px_rgba(167,139,250,0.25)]',
}

const labelClasses = computed(() =>
  twMerge(
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-[-0.02em] border transition-shadow',
    variantClasses[props.variant],
    props.color ? colorClasses[props.color] : '',
    props.class,
  ),
)
</script>
