import { FC, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { updateProfile, updateProfileImage } from '../../auth/api/authApi'
import { VALIDATION } from '../../auth/auth.constants'

const schema = z.object({
  nickname: z
    .string()
    .min(VALIDATION.NICKNAME_MIN, `닉네임은 ${VALIDATION.NICKNAME_MIN}자 이상이어야 합니다.`)
    .max(VALIDATION.NICKNAME_MAX, `닉네임은 ${VALIDATION.NICKNAME_MAX}자 이하이어야 합니다.`),
  bio: z
    .string()
    .max(VALIDATION.BIO_MAX, `자기소개는 ${VALIDATION.BIO_MAX}자 이하이어야 합니다.`),
})

type FormValues = z.infer<typeof schema>

const EditProfilePage: FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage ?? null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: user?.nickname ?? '',
      bio: user?.bio ?? '',
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (pendingImageFile) {
        const { data: imgData } = await updateProfileImage(pendingImageFile)
        updateUser(imgData.data)
      }
      const { data } = await updateProfile({
        nickname: values.nickname || undefined,
        bio: values.bio || undefined,
      })
      updateUser(data.data)
      toast.success('프로필이 수정되었습니다.')
      navigate('/me')
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data as { status?: { message?: string } })?.status?.message
        toast.error(msg ?? '프로필 수정에 실패했습니다.')
      }
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold text-content mb-6">프로필 수정</h1>
      <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-24 h-24 rounded-full bg-content/10 overflow-hidden cursor-pointer border-2 border-content/20 hover:border-primary transition-colors flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary hover:underline"
            >
              사진 변경
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
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
            <label className="block text-sm font-medium text-content mb-1">자기소개</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full border border-content/20 rounded-md px-3 py-2 bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="200자 이하로 입력해주세요"
            />
            {errors.bio && (
              <p className="text-error text-sm mt-1">{errors.bio.message}</p>
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
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfilePage
