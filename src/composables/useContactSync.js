import { onBeforeUnmount, ref } from 'vue'
import { submitContactSync } from '@/service/contact/contactSync.js'

const SUBMIT_DEBOUNCE_MS = 1000
const SUCCESS_CLOSE_DELAY_MS = 5000

export const useContactSync = () => {
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const errorMessage = ref('')
  const closeCountdown = ref(0)

  let submitTimer = null
  let closeTimer = null
  let countdownTimer = null

  const resetState = () => {
    isSubmitting.value = false
    isSuccess.value = false
    errorMessage.value = ''
    closeCountdown.value = 0
  }

  const clearTimers = () => {
    if (submitTimer) {
      clearTimeout(submitTimer)
      submitTimer = null
    }

    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }

    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  const submit = (payload, onSuccessClose) => {
    if (submitTimer) clearTimeout(submitTimer)

    submitTimer = setTimeout(async () => {
      if (isSubmitting.value) return

      isSubmitting.value = true
      isSuccess.value = false
      errorMessage.value = ''

      const result = await submitContactSync(payload)

      if (!result.ok) {
        errorMessage.value = 'Something went wrong'
        isSubmitting.value = false
        return
      }

      isSuccess.value = true
      isSubmitting.value = false

      closeCountdown.value = Math.ceil(SUCCESS_CLOSE_DELAY_MS / 1000)

      countdownTimer = setInterval(() => {
        if (closeCountdown.value > 1) {
          closeCountdown.value -= 1
        }
      }, 1000)

      closeTimer = setTimeout(() => {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
        resetState()
        onSuccessClose()
      }, SUCCESS_CLOSE_DELAY_MS)
    }, SUBMIT_DEBOUNCE_MS)
  }

  onBeforeUnmount(() => {
    clearTimers()
  })

  return {
    isSubmitting,
    isSuccess,
    errorMessage,
    closeCountdown,
    submit,
    resetState,
    clearTimers,
  }
}
