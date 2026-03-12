export const AUTH_ENDPOINTS = {
  SIGNUP: '/api/auth/signup',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  CHANGE_PASSWORD: '/api/auth/password',
  SEND_VERIFICATION_EMAIL: '/api/auth/email/verify',
  VERIFY_EMAIL_TOKEN: '/api/auth/verify',
} as const

export const USER_ENDPOINTS = {
  ME: '/api/users/me',
  PROFILE_IMAGE: '/api/users/me/profile-image',
  RECOVER: '/api/users/recover',
  PROFILE: (username: string) => `/api/users/${username}`,
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'geekyard_access_token',
  REFRESH_TOKEN: 'geekyard_refresh_token',
  DEVICE_ID: 'geekyard_device_id',
} as const

export const VALIDATION = {
  PASSWORD_MIN: 8,
  PASSWORD_PATTERN: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+<>?,./-=]).{8,}$/,
  NICKNAME_MIN: 2,
  NICKNAME_MAX: 20,
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  USERNAME_PATTERN: /^[a-z0-9_]{3,20}$/,
  BIO_MAX: 200,
} as const
