<script setup>
import { watch } from 'vue'
import BaseModal from '@/components/modal/BaseModal.vue'
import ContactSyncForm from '@/components/contact-sync/ContactSyncForm.vue'
import { useContactSync } from '@/composables/useContactSync.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const { isSubmitting, isSuccess, errorMessage, closeCountdown, submit, resetState, clearTimers } =
  useContactSync()

const close = () => {
  clearTimers()
  resetState()
  emit('update:modelValue', false)
}

const onSubmit = (payload) => {
  submit(payload, () => emit('update:modelValue', false))
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      clearTimers()
      resetState()
    }
  },
)
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Let’s Sync"
    max-width-class="max-w-2xl"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @close="close"
  >
    <div
      v-if="isSuccess"
      class="flex flex-col justify-center items-center rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
    >
      <p>Your message has been sent successfully</p>
      <p>Auto-closing in {{ closeCountdown }} ...</p>
    </div>

    <template v-else>
      <p class="mb-4 text-sm text-white/70">
        Share your goals and I will get back to you by email.
      </p>

      <ContactSyncForm :is-submitting="isSubmitting" @submit="onSubmit" @cancel="close" />

      <p v-if="errorMessage" class="mt-3 text-sm text-red-300">{{ errorMessage }}</p>
    </template>
  </BaseModal>
</template>
