import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import * as authApi from '../api/authApi'
import { setTokens } from '../auth.utils'

const schema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

type FormValues = z.infer<typeof schema>

const LoginForm: FC = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: loginData } = await authApi.login(values)
      const { accessToken, refreshToken } = loginData.data
      setTokens(accessToken, refreshToken)
      const { data: profileData } = await authApi.getMyProfile()
      login(profileData.data, accessToken, refreshToken)
      toast.success('로그인되었습니다.')
      navigate('/me')
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          toast.error('입력 정보를 확인해주세요.')
        } else if (err.response?.status === 403) {
          toast.error('삭제된 계정입니다. 계정 복구를 진행해주세요.')
        } else if (err.response?.status === 400) {
          const msg: string = err.response?.data?.status?.message ?? ''
          if (msg.includes('소셜 로그인')) {
            toast.error(msg)
          } else {
            toast.error('로그인에 실패했습니다.')
          }
        } else {
          toast.error('로그인에 실패했습니다.')
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-content mb-1">이메일</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="이메일을 입력해주세요"
        />
        {errors.email && (
          <p className="text-error text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-content mb-1">비밀번호</label>
        <input
          {...register('password')}
          type="password"
          className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="비밀번호를 입력해주세요"
        />
        {errors.password && (
          <p className="text-error text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white rounded-md py-2 font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}

export default LoginForm
