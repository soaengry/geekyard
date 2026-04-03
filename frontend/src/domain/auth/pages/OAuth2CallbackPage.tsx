import { FC, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { setTokens } from '../auth.utils'
import { getMyProfile } from '../api/authApi'
import { useAuthStore } from '../store/useAuthStore'

const OAuth2CallbackPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((state) => state.login)

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      toast.error('OAuth2 로그인에 실패했습니다.')
      navigate('/login')
      return
    }

    setTokens(accessToken, refreshToken)
    getMyProfile()
      .then(({ data }) => {
        login(data.data, accessToken, refreshToken)
        navigate('/me')
      })
      .catch(() => {
        toast.error('사용자 정보를 가져오는데 실패했습니다.')
        navigate('/login')
      })
  }, [searchParams, navigate, login])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
  )
}

export default OAuth2CallbackPage
