import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { deleteCollection, toggleCollectionLike } from '../api/animeListApi'
import { extractApiError } from '../../../global/utils/extractApiError'
import type { AnimeListDetail } from '../types'

interface CollectionHeaderProps {
  collection: AnimeListDetail
  onEditClick: () => void
}

const CollectionHeader: FC<CollectionHeaderProps> = ({ collection, onEditClick }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [likeCount, setLikeCount] = useState(collection.likeCount)
  const [liked, setLiked] = useState(collection.liked)
  const [likeLoading, setLikeLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다.')
      return
    }
    if (likeLoading) return
    setLikeLoading(true)
    try {
      const res = await toggleCollectionLike(collection.id)
      setLiked(res.liked)
      setLikeCount(res.likeCount)
    } catch (err) {
      toast.error(extractApiError(err, '좋아요 처리에 실패했습니다.'))
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCollection(collection.id)
      toast.success('컬렉션이 삭제되었습니다.')
      navigate('/collections')
    } catch (err) {
      toast.error(extractApiError(err, '컬렉션 삭제에 실패했습니다.'))
    }
  }

  return (
    <div className="collection-header mb-8">
      <div className="collection-header-top flex items-start justify-between gap-4">
        <div className="collection-header-info flex-1 min-w-0">
          <h1 className="collection-title text-2xl font-bold text-content">{collection.title}</h1>
          {collection.description && (
            <p className="collection-description text-subtle mt-2 whitespace-pre-line">{collection.description}</p>
          )}
        </div>

        {collection.isOwner && (
          <div className="collection-header-actions flex items-center gap-2 shrink-0">
            <button
              onClick={onEditClick}
              className="collection-edit-btn px-3 py-1.5 text-sm rounded-lg border border-content/20 text-content hover:border-primary hover:text-primary transition-colors"
            >
              수정
            </button>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="collection-delete-btn px-3 py-1.5 text-sm rounded-lg border border-content/20 text-error hover:border-error transition-colors"
              >
                삭제
              </button>
            ) : (
              <div className="collection-delete-confirm flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
                >
                  확인
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-content/20 text-content hover:border-content transition-colors"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="collection-header-meta flex items-center gap-4 mt-4">
        <div className="collection-author flex items-center gap-2">
          {collection.authorProfileImage ? (
            <img
              src={collection.authorProfileImage}
              alt={collection.authorNickname}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-content/20" />
          )}
          <span className="text-sm text-content">{collection.authorNickname}</span>
        </div>

        <span className="text-sm text-subtle">{collection.itemCount}개의 작품</span>

        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`collection-like-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            liked
              ? 'bg-primary/10 text-primary'
              : 'border border-content/20 text-subtle hover:border-primary hover:text-primary'
          }`}
        >
          <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likeCount}
        </button>
      </div>

    </div>
  )
}

export default CollectionHeader
