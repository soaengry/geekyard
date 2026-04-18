import { FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { toast } from 'react-toastify'
import { extractApiError } from '../../../global/utils/extractApiError'
import type { AnimeListItem } from '../../anime/types'
import { createFeed } from '../api/feedApi'
import AnimeSearchInput from './AnimeSearchInput'
import ImageUploadArea from './ImageUploadArea'

interface FeedFormProps {
  onCreated: () => void
  preSelectedAnimeId?: number
  preSelectedAnimeName?: string
}

const MAX_IMAGES = 4

const feedSchema = z.object({
  animeId: z.number().min(1, '애니메이션을 선택해주세요.').optional(),
  content: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(5000, '내용은 5000자 이내로 작성해주세요.'),
})

type FeedFormValues = z.infer<typeof feedSchema>

const FeedForm: FC<FeedFormProps> = ({
  onCreated,
  preSelectedAnimeId,
  preSelectedAnimeName,
}) => {
  const isPreSelected = preSelectedAnimeId != null && preSelectedAnimeId > 0
  const [selectedAnime, setSelectedAnime] = useState<AnimeListItem | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // 언마운트 시 생성된 모든 Blob URL 해제
  const imagePreviewsRef = useRef<string[]>([])
  imagePreviewsRef.current = imagePreviews

  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FeedFormValues>({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      animeId: isPreSelected ? preSelectedAnimeId : undefined,
      content: '',
    },
  })

  const handleAnimeSelect = (anime: AnimeListItem) => {
    setSelectedAnime(anime)
    setValue('animeId', anime.id, { shouldValidate: true })
  }

  const handleAnimeClear = () => {
    setSelectedAnime(null)
    setValue('animeId', undefined)
  }

  const handleImagesAdd = (newFiles: File[], newPreviews: string[]) => {
    setImageFiles((prev) => [...prev, ...newFiles])
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const handleImageRemove = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FeedFormValues) => {
    try {
      await createFeed(data, imageFiles.length > 0 ? imageFiles : undefined)
      toast.success('피드가 등록되었습니다.')
      reset({ animeId: isPreSelected ? preSelectedAnimeId : undefined, content: '' })
      if (!isPreSelected) setSelectedAnime(null)
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImageFiles([])
      setImagePreviews([])
      onCreated()
    } catch (err) {
      toast.error(extractApiError(err, '피드 등록에 실패했습니다.'))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="feed-form bg-surface rounded-xl border border-content/10 p-4 shadow-sm space-y-3"
    >
      {/* Anime selector */}
      <AnimeSearchInput
        selectedAnime={isPreSelected ? null : selectedAnime}
        onSelect={handleAnimeSelect}
        onClear={handleAnimeClear}
        error={!isPreSelected ? errors.animeId?.message : undefined}
        preSelectedName={isPreSelected ? preSelectedAnimeName : undefined}
      />

      {/* Content */}
      <textarea
        {...register('content')}
        placeholder="무슨 생각을 하고 있나요?"
        rows={3}
        className="feed-textarea w-full px-3 py-2 rounded-lg border border-content/10 bg-surface text-content text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-subtle"
      />
      {errors.content && (
        <p className="text-error text-xs mt-1">{errors.content.message}</p>
      )}

      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="feed-image-previews flex gap-2 flex-wrap">
          {imagePreviews.map((preview, idx) => (
            <div key={idx} className="feed-image-preview relative">
              <img
                src={preview}
                alt={`미리보기 ${idx + 1}`}
                className="rounded-lg w-24 h-24 object-cover"
              />
              <button
                type="button"
                onClick={() => handleImageRemove(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="feed-form-actions flex items-center justify-between">
        <ImageUploadArea
          count={imageFiles.length}
          max={MAX_IMAGES}
          onAdd={handleImagesAdd}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="feed-submit-btn px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '등록 중...' : '게시'}
        </button>
      </div>
    </form>
  )
}

export default FeedForm
