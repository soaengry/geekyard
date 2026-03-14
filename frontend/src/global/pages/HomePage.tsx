import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../domain/auth/store/useAuthStore'
import FeedForm from '../../domain/feed/components/FeedForm'
import FeedList from '../../domain/feed/components/FeedList'

const HomePage: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="home-page max-w-2xl mx-auto py-6">
      <h1 className="home-title text-2xl font-bold text-content mb-1">피드</h1>
      <p className="home-subtitle text-subtle text-sm mb-6">애니메이션 커뮤니티 공간</p>

      {!isAuthenticated ? (
        <div className="home-cta text-center py-12 bg-surface rounded-xl border border-content/10 mb-6">
          <h2 className="text-xl font-bold text-content mb-2">GeekYard</h2>
          <p className="text-subtle text-sm mb-6">지금 가입하고 피드를 작성해보세요!</p>
          <div className="flex justify-center gap-3">
            <Link
              to="/signup"
              className="bg-primary text-white px-8 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              시작하기
            </Link>
            <Link
              to="/login"
              className="border border-primary text-primary px-8 py-2.5 rounded-full font-medium hover:bg-primary/10 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      ) : (
        <div className="feed-form-wrapper mb-6">
          <FeedForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </div>
      )}

      <FeedList refreshKey={refreshKey} />
    </div>
  )
}

export default HomePage
