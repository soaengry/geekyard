import { FC } from 'react'
import { Link } from 'react-router-dom'
import { SignUpForm } from '../components'

const SignUpPage: FC = () => {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold text-center text-content mb-8">회원가입</h1>
      <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6">
        <SignUpForm />
        <p className="mt-6 text-center text-sm text-subtle">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage
