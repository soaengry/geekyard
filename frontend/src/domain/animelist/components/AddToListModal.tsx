import { FC, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  getMyCollections,
  addItemToCollection,
  createCollection,
} from '../api/animeListApi'
import { extractApiError } from '../../../global/utils/extractApiError'
import type { MyAnimeList } from '../types'

interface AddToListModalProps {
  animeId: number
  animeName: string
  onClose: () => void
}

const AddToListModal: FC<AddToListModalProps> = ({
  animeId,
  animeName,
  onClose,
}) => {
  const [lists, setLists] = useState<MyAnimeList[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [addingId, setAddingId] = useState<number | null>(null)

  useEffect(() => {
    getMyCollections()
      .then(setLists)
      .catch(() => toast.error('리스트를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToList = async (listId: number) => {
    if (addingId) return
    setAddingId(listId)
    try {
      await addItemToCollection(listId, animeId)
      const targetList = lists.find((l) => l.id === listId)
      toast.success(
        `"${targetList?.title}" 리스트에 추가되었습니다.`,
      )
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, '리스트 추가에 실패했습니다.'))
    } finally {
      setAddingId(null)
    }
  }

  const handleCreateAndAdd = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const created = await createCollection({ title: newTitle.trim() })
      await addItemToCollection(created.id, animeId)
      toast.success(`"${newTitle.trim()}" 리스트에 추가되었습니다.`)
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, '리스트 생성에 실패했습니다.'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div
      className="add-to-list-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="add-to-list-modal bg-surface rounded-2xl w-full max-w-sm mx-4 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="add-to-list-header flex items-center justify-between px-5 py-4 border-b border-content/10">
          <h3 className="add-to-list-title text-base font-bold text-content">
            리스트 추가
          </h3>
          <button
            onClick={onClose}
            className="add-to-list-close w-7 h-7 rounded-full hover:bg-content/10 flex items-center justify-center text-subtle hover:text-content transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Selected anime name */}
        <div className="add-to-list-anime px-5 py-3 bg-content/5 border-b border-content/10">
          <p className="text-xs text-subtle">선택된 작품</p>
          <p className="text-sm font-medium text-content mt-0.5 line-clamp-1">
            {animeName}
          </p>
        </div>

        {/* Create new list */}
        <div className="add-to-list-create px-5 py-3 border-b border-content/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTitle.trim()) handleCreateAndAdd()
              }}
              placeholder="새 리스트 이름"
              className="add-to-list-input flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-content/20 bg-transparent text-content placeholder:text-subtle focus:border-primary focus:outline-none transition-colors"
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={!newTitle.trim() || creating}
              className="add-to-list-create-btn shrink-0 px-3 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {creating ? '...' : '만들기'}
            </button>
          </div>
        </div>

        {/* List items */}
        <div className="add-to-list-items max-h-64 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="px-5 py-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-content/10 animate-pulse"
                />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="px-5 py-8 text-center text-subtle text-sm">
              아직 만든 리스트가 없습니다
            </div>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleAddToList(list.id)}
                disabled={addingId === list.id}
                className="add-to-list-item w-full text-left px-5 py-3 hover:bg-content/5 transition-colors border-b border-content/5 last:border-b-0 disabled:opacity-50"
              >
                <p className="add-to-list-item-title text-sm font-medium text-content line-clamp-1">
                  {list.title}
                </p>
                <p className="add-to-list-item-count text-xs text-subtle mt-0.5">
                  {list.itemCount}개의 작품
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AddToListModal
