import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../domain/auth/store/useAuthStore'

const HomePage: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <div className="home-page max-w-2xl mx-auto text-center py-20">
      <h1 className="home-title text-5xl font-bold text-content mb-3">GeekYard</h1>
      <p className="home-subtitle text-subtle text-lg mb-10">애니메이션 커뮤니티 공간</p>
      {!isAuthenticated && (
        <div className="home-cta flex justify-center gap-4">
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
      )}
    </div>
  )
}

export default HomePage
