import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { toast } from 'react-toastify'
import { getAnimeList } from '../../anime/api/animeApi'
import { extractApiError } from '../../../global/utils/extractApiError'
import type { AnimeListItem } from '../../anime/types'
import { createFeed } from '../api/feedApi'

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
  const [animeQuery, setAnimeQuery] = useState('')
  const [animeResults, setAnimeResults] = useState<AnimeListItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const searchAnime = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAnimeResults([])
      return
    }
    try {
      const data = await getAnimeList({ q: query, size: 5 })
      setAnimeResults(data.content)
    } catch {
      setAnimeResults([])
    }
  }, [])

  useEffect(() => {
    if (isPreSelected) return
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => searchAnime(animeQuery), 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [animeQuery, searchAnime, isPreSelected])

  useEffect(() => {
    if (isPreSelected) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPreSelected])

  const selectAnime = (anime: AnimeListItem) => {
    setSelectedAnime(anime)
    setValue('animeId', anime.id, { shouldValidate: true })
    setAnimeQuery('')
    setShowDropdown(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const remaining = MAX_IMAGES - imageFiles.length
    const toAdd = files.slice(0, remaining)
    if (toAdd.length < files.length) {
      toast.info(`이미지는 최대 ${MAX_IMAGES}장까지 가능합니다.`)
    }

    setImageFiles((prev) => [...prev, ...toAdd])
    const newPreviews = toAdd.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
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
      {isPreSelected ? (
        <div className="selected-anime flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-content flex-1 truncate">
            {preSelectedAnimeName}
          </span>
        </div>
      ) : (
        <div className="anime-selector" ref={dropdownRef}>
          {selectedAnime ? (
            <div className="selected-anime flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
              {selectedAnime.img && (
                <img
                  src={selectedAnime.img}
                  alt={selectedAnime.name}
                  className="w-8 h-10 rounded object-cover"
                />
              )}
              <span className="text-sm font-medium text-content flex-1 truncate">
                {selectedAnime.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedAnime(null)
                  setValue('animeId', undefined)
                }}
                className="text-subtle hover:text-content text-sm px-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="anime-search relative">
              <input
                type="text"
                value={animeQuery}
                onChange={(e) => {
                  setAnimeQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="애니메이션을 검색하세요..."
                className="anime-search-input w-full px-3 py-2 rounded-lg border border-content/10 bg-surface text-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-subtle"
              />
              {showDropdown && animeResults.length > 0 && (
                <div className="anime-dropdown absolute z-20 top-full left-0 right-0 mt-1 bg-surface border border-content/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {animeResults.map((anime) => (
                    <button
                      key={anime.id}
                      type="button"
                      onClick={() => selectAnime(anime)}
                      className="anime-option w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/5 transition-colors text-left"
                    >
                      {anime.img && (
                        <img
                          src={anime.img}
                          alt={anime.name}
                          className="w-6 h-8 rounded object-cover shrink-0"
                        />
                      )}
                      <span className="text-sm text-content truncate">
                        {anime.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {errors.animeId && (
            <p className="text-error text-xs mt-1">{errors.animeId.message}</p>
          )}
        </div>
      )}

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
                onClick={() => removeImage(idx)}
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
        <label
          className={`image-upload-label cursor-pointer transition-colors ${
            imageFiles.length >= MAX_IMAGES
              ? 'text-content/20 cursor-not-allowed'
              : 'text-subtle hover:text-primary'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {imageFiles.length > 0 && (
            <span className="text-xs ml-1">
              {imageFiles.length}/{MAX_IMAGES}
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            disabled={imageFiles.length >= MAX_IMAGES}
            className="hidden"
          />
        </label>
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
