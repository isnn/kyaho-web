import axios from 'axios'

const parseErrorMessage = (data) => {
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  if (typeof data?.error === 'string' && data.error.trim()) return data.error
  return 'Something went wrong'
}

export const submitContactSync = async (payload) => {
  const requestBody = {
    email: payload.email?.trim() ?? '',
    brief: payload.briefObjectives?.trim() ?? payload.brief?.trim() ?? '',
    inquiry_type: payload.inquiryType?.trim() ?? '',
    organization: payload.organization?.trim() ?? payload.nameOrOrganization?.trim() ?? '',
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/sync`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    if (response.status !== 201) {
      throw new Error(parseErrorMessage(response.data))
    }

    return response.data
  } catch (error) {
    const responseData = error?.response?.data
    throw new Error(parseErrorMessage(responseData))
  }
}
