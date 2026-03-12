import { create } from 'zustand'
import { MyProfileResponse } from '../types'
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../auth.utils'
import { getMyProfile } from '../api/authApi'

interface AuthState {
  user: MyProfileResponse | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: MyProfileResponse, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: MyProfileResponse) => void
  restoreAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken)
    set({ user, accessToken, refreshToken, isAuthenticated: true })
  },

  logout: () => {
    clearTokens()
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  updateUser: (user) => set({ user }),

  restoreAuth: async () => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()

    if (!accessToken) {
      set({ isLoading: false })
      return
    }

    try {
      const { data } = await getMyProfile()
      set({
        user: data.data,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      clearTokens()
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
