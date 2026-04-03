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
import { VALIDATION } from '../auth.constants'

const schema = z
  .object({
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z
      .string()
      .min(VALIDATION.PASSWORD_MIN, `비밀번호는 ${VALIDATION.PASSWORD_MIN}자 이상이어야 합니다.`)
      .regex(VALIDATION.PASSWORD_PATTERN, '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    nickname: z
      .string()
      .min(VALIDATION.NICKNAME_MIN, `닉네임은 ${VALIDATION.NICKNAME_MIN}자 이상이어야 합니다.`)
      .max(VALIDATION.NICKNAME_MAX, `닉네임은 ${VALIDATION.NICKNAME_MAX}자 이하이어야 합니다.`),
    username: z
      .string()
      .regex(
        VALIDATION.USERNAME_PATTERN,
        '아이디는 영문 소문자, 숫자, 밑줄(_)만 사용 가능하며 3~20자이어야 합니다.',
      ),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword && password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

const SignUpForm: FC = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

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
      const { data: signupData } = await authApi.signup({
        email: values.email,
        password: values.password,
        nickname: values.nickname,
        username: values.username,
      })
      const { accessToken, refreshToken } = signupData.data
      setTokens(accessToken, refreshToken)
      const { data: profileData } = await authApi.getMyProfile()
      login(profileData.data, accessToken, refreshToken)
      toast.success('회원가입이 완료되었습니다.')
      navigate('/genre-selection')
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          toast.error('이미 사용 중인 이메일 또는 아이디입니다.')
        } else {
          toast.error('회원가입에 실패했습니다.')
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
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
        />
        {errors.password && (
          <p className="text-error text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-content mb-1">비밀번호 확인</label>
        <input
          {...register('confirmPassword')}
          type="password"
          className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="비밀번호를 다시 입력해주세요"
        />
        {errors.confirmPassword && (
          <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-content mb-1">닉네임</label>
        <input
          {...register('nickname')}
          type="text"
          className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="2~20자로 입력해주세요"
        />
        {errors.nickname && (
          <p className="text-error text-sm mt-1">{errors.nickname.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-content mb-1">아이디</label>
        <input
          {...register('username')}
          type="text"
          className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="영문 소문자, 숫자, 밑줄(_) 3~20자"
        />
        {errors.username && (
          <p className="text-error text-sm mt-1">{errors.username.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white rounded-md py-2 font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? '처리 중...' : '회원가입'}
      </button>
    </form>
  )
}

export default SignUpForm
