import axiosInstance from '../../../global/api/axiosInstance'
import {
  SignupRequest,
  LoginRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  RecoverAccountRequest,
  TokenResponse,
  MyProfileResponse,
  UserProfileResponse,
  ApiResponse,
} from '../types'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '../auth.constants'
import { getRefreshToken } from '../auth.utils'

export const signup = (data: SignupRequest) =>
  axiosInstance.post<ApiResponse<TokenResponse>>(AUTH_ENDPOINTS.SIGNUP, data)

export const login = (data: LoginRequest) =>
  axiosInstance.post<ApiResponse<TokenResponse>>(AUTH_ENDPOINTS.LOGIN, data)

export const logout = () => {
  const refreshToken = getRefreshToken()
  return axiosInstance.post<ApiResponse<null>>(
    AUTH_ENDPOINTS.LOGOUT,
    {},
    { headers: { 'X-Refresh-Token': refreshToken ?? '' } },
  )
}

export const refreshTokenApi = (refreshToken: string) =>
  axiosInstance.post<ApiResponse<TokenResponse>>(
    AUTH_ENDPOINTS.REFRESH,
    {},
    { headers: { 'X-Refresh-Token': refreshToken } },
  )

export const changePassword = (data: ChangePasswordRequest) =>
  axiosInstance.patch<ApiResponse<null>>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data)

export const getMyProfile = () =>
  axiosInstance.get<ApiResponse<MyProfileResponse>>(USER_ENDPOINTS.ME)

export const updateProfile = (data: UpdateProfileRequest) =>
  axiosInstance.patch<ApiResponse<MyProfileResponse>>(USER_ENDPOINTS.ME, data)

export const deleteAccount = () =>
  axiosInstance.delete<ApiResponse<null>>(USER_ENDPOINTS.ME)

export const recoverAccount = (data: RecoverAccountRequest) =>
  axiosInstance.post<ApiResponse<null>>(USER_ENDPOINTS.RECOVER, data)

export const getUserProfile = (username: string) =>
  axiosInstance.get<ApiResponse<UserProfileResponse>>(USER_ENDPOINTS.PROFILE(username))

export const sendVerificationEmail = (email: string) =>
  axiosInstance.post<ApiResponse<null>>(AUTH_ENDPOINTS.SEND_VERIFICATION_EMAIL, { email })

export const verifyEmailToken = (token: string) =>
  axiosInstance.get<ApiResponse<null>>(AUTH_ENDPOINTS.VERIFY_EMAIL_TOKEN, { params: { token } })

export const updateProfileImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return axiosInstance.patch<ApiResponse<MyProfileResponse>>(USER_ENDPOINTS.PROFILE_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
