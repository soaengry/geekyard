import { FC } from 'react'
import { Link } from 'react-router-dom'
import { LoginForm, SocialLoginButtons } from '../components'

const LoginPage: FC = () => {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold text-center text-content mb-8">로그인</h1>
      <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6">
        <LoginForm />
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-content/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface text-subtle">또는</span>
          </div>
        </div>
        <div className="mt-4">
          <SocialLoginButtons />
        </div>
        <div className="mt-6 text-center text-sm text-subtle space-y-2">
          <p>
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </p>
          <p>
            삭제된 계정을 복구하려면?{' '}
            <Link to="/restore" className="text-primary hover:underline">
              계정 복구
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
