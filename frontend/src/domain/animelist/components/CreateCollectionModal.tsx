import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { createCollection } from '../api/animeListApi'
import { extractApiError } from '../../../global/utils/extractApiError'

const schema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이내로 작성해주세요.'),
  description: z.string().max(2000, '설명은 2000자 이내로 작성해주세요.').optional().or(z.literal('')),
  isPublic: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface CreateCollectionModalProps {
  onClose: () => void
  onCreated: () => void
}

const CreateCollectionModal: FC<CreateCollectionModalProps> = ({ onClose, onCreated }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', isPublic: true },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await createCollection({
        title: data.title,
        description: data.description || undefined,
        isPublic: data.isPublic,
      })
      toast.success('컬렉션이 생성되었습니다.')
      onCreated()
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, '컬렉션 생성에 실패했습니다.'))
    }
  }

  return (
    <div
      className="create-collection-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="create-collection-modal bg-surface rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="create-collection-title text-lg font-bold text-content mb-4">
          컬렉션 만들기
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="create-collection-form space-y-4">
          <div className="form-field">
            <label className="form-label block text-sm font-medium text-content mb-1">
              제목 <span className="text-error">*</span>
            </label>
            <input
              {...register('title')}
              className="form-input w-full px-3 py-2 rounded-lg border border-content/20 bg-transparent text-content placeholder:text-subtle focus:border-primary focus:outline-none transition-colors"
              placeholder="컬렉션 제목을 입력하세요"
            />
            {errors.title && (
              <p className="form-error text-xs text-error mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="form-field">
            <label className="form-label block text-sm font-medium text-content mb-1">
              설명
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="form-textarea w-full px-3 py-2 rounded-lg border border-content/20 bg-transparent text-content placeholder:text-subtle focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="컬렉션에 대한 설명을 입력하세요"
            />
            {errors.description && (
              <p className="form-error text-xs text-error mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="form-field flex items-center justify-between">
            <label className="form-label text-sm font-medium text-content">
              공개 여부
            </label>
            <label className="form-toggle relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-content/20 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          <div className="form-actions flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="form-cancel-btn px-4 py-2 text-sm rounded-lg border border-content/20 text-content hover:border-content transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="form-submit-btn px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '생성 중...' : '만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCollectionModal
