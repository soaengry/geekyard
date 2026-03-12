import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { changePassword } from '../../auth/api/authApi'
import { VALIDATION } from '../../auth/auth.constants'

const schema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: z
      .string()
      .min(VALIDATION.PASSWORD_MIN, `새 비밀번호는 ${VALIDATION.PASSWORD_MIN}자 이상이어야 합니다.`)
      .regex(VALIDATION.PASSWORD_PATTERN, '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'),
    confirmNewPassword: z.string().min(1, '새 비밀번호 확인을 입력해주세요.'),
  })
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '새 비밀번호가 일치하지 않습니다.',
        path: ['confirmNewPassword'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

const ChangePasswordPage: FC = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      toast.success('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
      logout()
      navigate('/login')
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 403) {
          toast.error('현재 비밀번호가 올바르지 않습니다.')
        } else {
          toast.error('비밀번호 변경에 실패했습니다.')
        }
      }
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold text-content mb-6">비밀번호 변경</h1>
      <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-content mb-1">현재 비밀번호</label>
            <input
              {...register('currentPassword')}
              type="password"
              className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="현재 비밀번호를 입력해주세요"
            />
            {errors.currentPassword && (
              <p className="text-error text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-content mb-1">새 비밀번호</label>
            <input
              {...register('newPassword')}
              type="password"
              className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="8자 이상 입력해주세요"
            />
            {errors.newPassword && (
              <p className="text-error text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-content mb-1">새 비밀번호 확인</label>
            <input
              {...register('confirmNewPassword')}
              type="password"
              className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="새 비밀번호를 다시 입력해주세요"
            />
            {errors.confirmNewPassword && (
              <p className="text-error text-sm mt-1">{errors.confirmNewPassword.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/me')}
              className="flex-1 border border-content/20 text-content rounded-md py-2 hover:bg-background transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white rounded-md py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? '변경 중...' : '변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordPage
