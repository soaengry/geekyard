import { FC } from 'react'
import { ENV } from '../../../global/config/env'

const SocialLoginButtons: FC = () => {
  const handleOAuth2Login = (provider: string) => {
    window.location.href = `${ENV.OAUTH2_BASE_URL}/${provider}`
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleOAuth2Login('kakao')}
        className="w-full bg-yellow-400 text-gray-900 rounded-md py-2 font-medium hover:bg-yellow-400/90 transition-colors"
      >
        카카오로 로그인
      </button>
      <button
        type="button"
        onClick={() => handleOAuth2Login('naver')}
        className="w-full bg-green-500 text-white rounded-md py-2 font-medium hover:bg-green-500/90 transition-colors"
      >
        네이버로 로그인
      </button>
      <button
        type="button"
        onClick={() => handleOAuth2Login('google')}
        className="w-full bg-surface text-content border border-content/20 rounded-md py-2 font-medium hover:bg-background transition-colors"
      >
        구글로 로그인
      </button>
    </div>
  )
}

export default SocialLoginButtons
