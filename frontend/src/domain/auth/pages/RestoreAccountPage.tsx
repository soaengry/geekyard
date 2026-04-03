import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'
import * as authApi from '../api/authApi'

const schema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

type FormValues = z.infer<typeof schema>

const RestoreAccountPage: FC = () => {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.recoverAccount(values)
      toast.success('계정이 복구되었습니다. 로그인해주세요.')
      navigate('/login')
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 404) {
          toast.error('해당 계정을 찾을 수 없습니다.')
        } else {
          toast.error('계정 복구에 실패했습니다.')
        }
      }
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold text-center text-content mb-8">계정 복구</h1>
      <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6">
        <p className="text-sm text-subtle mb-6">
          삭제된 계정을 복구합니다. 이메일과 비밀번호를 입력해주세요.
        </p>
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
            {isSubmitting ? '처리 중...' : '계정 복구'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-subtle">
          <Link to="/login" className="text-primary hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RestoreAccountPage
