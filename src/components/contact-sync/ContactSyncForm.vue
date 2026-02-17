<script setup>
import { reactive, ref } from 'vue'
import Button from '@/components/button/Button.vue'
import Dropdown from '@/components/dropdown/Dropdown.vue'
import { trackMetric } from '@/service/telemetry/sentry'

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const inquiryOptions = ['Full-time', 'Freelance', 'Consulting', 'Speaking/Mentoring', 'Other']

const form = reactive({
  nameOrOrganization: '',
  email: '',
  inquiryType: 'Freelance',
  briefObjectives: '',
})

const validationMessage = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const handleSubmit = () => {
  trackMetric('contact_sync_submit_click_total', 1, { location: 'contact_sync_modal' })

  validationMessage.value = ''

  const payload = {
    nameOrOrganization: form.nameOrOrganization.trim(),
    email: form.email.trim(),
    inquiryType: form.inquiryType,
    briefObjectives: form.briefObjectives.trim(),
  }

  if (!payload.nameOrOrganization || payload.nameOrOrganization.length < 2) {
    validationMessage.value = 'Please enter name or organization.'
    return
  }

  if (!emailRegex.test(payload.email)) {
    validationMessage.value = 'Please enter a valid email.'
    return
  }

  if (!payload.briefObjectives || payload.briefObjectives.length < 10) {
    validationMessage.value = 'Please enter brief objectives (minimum 10 characters).'
    return
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label class="mb-1 block text-sm text-white/80"
        >Name / Organization <span class="text-primary-500 font-bold">*</span></label
      >
      <input
        v-model="form.nameOrOrganization"
        type="text"
        class="w-full rounded-md border border-white/15 bg-[#0b0f0d] px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
        placeholder="Your name or organization"
        maxlength="120"
        required
      />
    </div>

    <div>
      <label class="mb-1 block text-sm text-white/80"
        >Email <span class="text-primary-500 font-bold">*</span></label
      >
      <input
        v-model="form.email"
        type="email"
        class="w-full rounded-md border border-white/15 bg-[#0b0f0d] px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
        placeholder="you@example.com"
        maxlength="160"
        required
      />
    </div>

    <div>
      <label class="mb-1 block text-sm text-white/80"
        >Inquiry Type <span class="text-primary-500 font-bold">*</span></label
      >
      <Dropdown v-model="form.inquiryType" :options="inquiryOptions" />
    </div>

    <div>
      <label class="mb-1 block text-sm text-white/80"
        >Brief Objectives <span class="text-primary-500 font-bold">*</span></label
      >
      <textarea
        v-model="form.briefObjectives"
        rows="5"
        class="w-full rounded-md border border-white/15 bg-[#0b0f0d] px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
        placeholder="Tell me what you are building and what help you need"
        maxlength="2000"
        required
      />
    </div>

    <p v-if="validationMessage" class="text-sm text-red-300">{{ validationMessage }}</p>

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="ghost" @click="emit('cancel')"> Cancel </Button>
      <Button type="submit" :loading="props.isSubmitting" :disabled="props.isSubmitting">
        {{ props.isSubmitting ? 'Submitting...' : 'Submit' }}
      </Button>
    </div>
  </form>
</template>
