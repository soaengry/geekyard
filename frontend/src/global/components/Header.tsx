import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../domain/auth/store/useAuthStore'
import { useScrollDirection } from '../hooks/useScrollDirection'

const Header: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const scrollDirection = useScrollDirection()

  return (
    <header
      className={`app-header bg-surface border-b border-content/10 sticky top-0 z-10 transition-transform duration-300 ${
        scrollDirection === 'down' ? 'md:translate-y-0 -translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="header-inner container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="header-left flex items-center gap-6">
          <Link to="/" className="app-logo text-xl font-bold text-primary tracking-tight">
            GeekYard
          </Link>
          <Link to="/" className="nav-link hidden md:inline text-content hover:text-primary font-medium transition-colors text-sm">
            피드
          </Link>
          <Link to="/anime" className="nav-link hidden md:inline text-content hover:text-primary font-medium transition-colors text-sm">
            애니
          </Link>
          <Link to="/collections" className="nav-link hidden md:inline text-content hover:text-primary font-medium transition-colors text-sm">
            리스트
          </Link>
        </div>
        <nav className="header-nav flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <Link
              to="/me"
              className="header-profile flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors group"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.nickname}
                  className="header-avatar w-7 h-7 rounded-full object-cover ring-1 ring-content/10"
                />
              ) : (
                <span className="header-avatar w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center ring-1 ring-primary/30">
                  {user?.nickname?.[0]?.toUpperCase()}
                </span>
              )}
              <span className="header-nickname font-semibold text-content group-hover:text-primary transition-colors">
                {user?.nickname}
              </span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="header-login text-content hover:text-primary font-medium transition-colors px-2 py-1"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="header-signup bg-primary text-white px-4 py-1.5 rounded-full font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
