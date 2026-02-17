const buildContactSyncUrl = () => {
  const base = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!base) {
    throw new Error('Missing VITE_API_BASE_URL')
  }

  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return new URL('api/v1/contact/sync', normalizedBase).toString()
}

const BYPASS_DELAY_MS = 700
const BYPASS_API_FOR_TEST = true

export const submitContactSync = async (payload) => {
  const body = {
    ...payload,
    source: 'portfolio_web',
  }

  if (BYPASS_API_FOR_TEST) {
    await new Promise((resolve) => setTimeout(resolve, BYPASS_DELAY_MS))
    return { ok: true }
  }

  try {
    const response = await fetch(buildContactSyncUrl(), {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return { ok: false, message: 'Something went wrong' }
    }

    return { ok: true }
  } catch {
    return { ok: false, message: 'Something went wrong' }
  }
}
