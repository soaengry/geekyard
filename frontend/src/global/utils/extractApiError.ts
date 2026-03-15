import { isAxiosError } from 'axios'

export const extractApiError = (err: unknown, fallback: string): string => {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { status?: { message?: string } })?.status?.message
    return msg ?? fallback
  }
  return fallback
}
