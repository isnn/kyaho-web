<template>
  <article
    class="flex flex-col px-12 lg:px-20 lg:py-8 justify-between transition-colors duration-300"
    :class="alignText === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'"
  >
    <div class="lg:w-2/3 my-[5%]">
      <h3 class="text-lg sm:text-xl font-semibold text-white tracking-[-0.02em]">
        {{ title }}
      </h3>

      <div class="mt-3 flex flex-wrap gap-2">
        <Label :text="labels.appType" variant="appType" />
        <Label :text="labels.role" variant="role" />
        <Label :text="labels.impactText" variant="impact" />
      </div>

      <p class="mt-4 text-sm text-white/60 leading-relaxed line-clamp-3">
        {{ description }}
      </p>

      <a
        v-if="showActionButton !== false"
        :href="link"
        target="_blank"
        rel="noopener noreferrer"
        class="duration-500 ease-in-out opacity-60 hover:opacity-100 inline-flex items-center gap-2.5 rounded-md text-sm py-1.5 px-3 mt-2 text-white hover:text-white bg-transparent from-transparent to-transparent hover:bg-accent-800 hover:rounded-md w-fit"
      >
        <span> View Case </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"
        >
          <path
            d="M646-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h446L532-634q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T589-691l183 183q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L589-269q-12 12-28.5 11.5T532-270q-11-12-11.5-28t11.5-28l114-114Z"
          />
        </svg>
      </a>
    </div>

    <div
      :class="
        twMerge(
          'rounded-4xl bg-black/20 h-[30vh] sm:h-[40vh] lg:h-[50vh] border-white/10 shadow-inner overflow-hidden mx-auto flex justify-center items-center',
          alignText === 'left' ? 'lg:ml-[10%]' : 'lg:mr-[10%]',
          imageBgColor,
        )
      "
    >
      <slot name="visual" />
      <div class="relative w-full h-full">
        <img v-if="image" :src="image" :alt="title" class="w-full h-full object-cover" />
        <img
          v-else
          src="https://images.unsplash.com/photo-1740532428093-eaa845a66fca?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          :alt="title"
          class="w-full h-full object-cover"
        />
        <div
          v-if="showNdaBadge"
          class="absolute bottom-3 right-6 flex items-center justify-center gap-2 opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path
              d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm296.5-223.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"
            />
          </svg>
          <div class="flex flex-col">
            <span class="text-xs text-white/90 font-bold">NDA</span>
            <span class="text-[10px] text-white/90 font-bold">PROTECTED</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import Label from '../label/Label.vue'
import { twMerge } from 'tailwind-merge'

defineProps({
  title: String,
  description: String,
  labels: {
    type: Object,
    default: () => ({
      appType: '',
      role: '',
      impactText: '',
    }),
  },
  link: String,
  alignText: {
    type: String,
    default: 'left',
  },
  image: {
    type: String,
    default:
      'https://images.unsplash.com/photo-1740532428093-eaa845a66fca?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  imageBgColor: {
    type: String,
    default: 'bg-black/20',
  },
  showNdaBadge: {
    type: Boolean,
    default: false,
  },
  showActionButton: {
    type: Boolean,
    default: true,
  },
})
</script>
