<template>
  <div
    :class="
      tw(
        'flex flex-col font-semibold leading-5 justify-end text-[14px] text-[#8a8f98] p-4 rounded-xl outline-none bg-[#141516] transition-colors duration-200 ease-out',
        $attrs.class,
      )
    "
  >
    <slot />
  </div>
</template>

<script>
import { twMerge } from 'tailwind-merge'

export default {
  name: 'Highlighter',
  inheritAttrs: false,
  methods: {
    tw(...classes) {
      return twMerge(...classes)
    },
  },
}
</script>
