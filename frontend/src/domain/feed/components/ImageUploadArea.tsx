import { FC, useRef } from 'react'
import { toast } from 'react-toastify'

interface ImageUploadAreaProps {
  /** 현재 선택된 파일 수 */
  count: number
  max: number
  onAdd: (newFiles: File[], newPreviews: string[]) => void
}

/**
 * 이미지 업로드 트리거 버튼.
 * 파일 선택 시 Blob URL을 생성하여 onAdd로 전달한다.
 * Blob URL 해제는 부모 컴포넌트(FeedForm)가 책임진다.
 */
const ImageUploadArea: FC<ImageUploadAreaProps> = ({ count, max, onAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    const remaining = max - count
    const toAdd = selected.slice(0, remaining)
    if (toAdd.length < selected.length) {
      toast.info(`이미지는 최대 ${max}장까지 가능합니다.`)
    }

    const newPreviews = toAdd.map((file) => URL.createObjectURL(file))
    onAdd(toAdd, newPreviews)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isFull = count >= max

  return (
    <label
      className={`image-upload-label cursor-pointer transition-colors flex items-center gap-1 ${
        isFull ? 'text-content/20 cursor-not-allowed' : 'text-subtle hover:text-primary'
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
      {count > 0 && <span className="text-xs">{count}/{max}</span>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleChange}
        disabled={isFull}
        className="hidden"
      />
    </label>
  )
}

export default ImageUploadArea
