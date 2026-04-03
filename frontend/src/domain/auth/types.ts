export interface SignupRequest {
  email: string
  password: string
  nickname: string
  username: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  nickname?: string
  bio?: string
}

export interface RecoverAccountRequest {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export type AuthProvider = 'GOOGLE' | 'KAKAO' | 'NAVER' | 'TWITTER'

export interface MyProfileResponse {
  id: number
  email: string
  username: string
  nickname: string
  bio: string | null
  profileImage: string | null
  authProvider: AuthProvider | null
  emailVerified?: boolean
  createdAt: string
}

export interface UserProfileResponse {
  username: string
  nickname: string
  bio: string | null
  profileImage: string | null
}

export interface ApiResponse<T> {
  status: { code: number; message: string }
  data: T
}
