import { FC } from 'react'
import { Link } from 'react-router-dom'
import type { AnimeListSummary } from '../types'

interface CollectionCardProps {
  collection: AnimeListSummary
}

const CollectionCard: FC<CollectionCardProps> = ({ collection }) => {
  const { id, title, description, coverImages, authorNickname, authorProfileImage, likeCount, itemCount } = collection

  return (
    <Link
      to={`/collections/${id}`}
      className="collection-card block rounded-xl bg-surface shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] overflow-hidden"
    >
      <div className="collection-card-cover grid grid-cols-2 aspect-[4/3] bg-content/10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="collection-card-cover-item overflow-hidden">
            {coverImages[i] ? (
              <img
                src={coverImages[i]}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-content/5" />
            )}
          </div>
        ))}
      </div>

      <div className="collection-card-body p-3">
        <h3 className="collection-card-title text-sm font-semibold text-content line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="collection-card-description text-xs text-subtle mt-1 line-clamp-2">
            {description}
          </p>
        )}

        <div className="collection-card-meta flex items-center gap-2 mt-2">
          <div className="collection-card-author flex items-center gap-1.5">
            {authorProfileImage ? (
              <img
                src={authorProfileImage}
                alt={authorNickname}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-content/20" />
            )}
            <span className="text-xs text-subtle">{authorNickname}</span>
          </div>

          <div className="collection-card-stats flex items-center gap-2 ml-auto text-xs text-subtle">
            <span className="collection-card-like-count flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount}
            </span>
            <span className="collection-card-item-count">{itemCount}개</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CollectionCard
