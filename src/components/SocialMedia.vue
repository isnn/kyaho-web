<template>
  <section class="bg-[#050f07] text-white flex justify-center items-center py-4">
    <div
      class="flex items-center group hover:text-secondary-500 cursor-pointer transition-colors duration-300"
    >
      <div class="m-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"
        >
          <path
            d="M760-640q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h404q-4 20-4 40t4 40q7 32 23 59.5t39 48.5l-146 92-320-200v80l320 200 211-132q17 6 34 9t35 3q32 0 63-10t57-30v360q0 33-23.5 56.5T800-160H160Z"
          />
        </svg>
      </div>
      <div class="text-sm text-center font-light"><span>isnan@hokya.dev</span></div>
    </div>
  </section>
</template>

<script setup>
defineOptions({
  name: 'SocialMedia',
})
</script>
