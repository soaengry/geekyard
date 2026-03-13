import { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../domain/auth/store/useAuthStore'
import { logout } from '../../domain/auth/api/authApi'

const Header: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logoutStore = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // 서버 오류가 있어도 로컬 상태는 초기화
    }
    logoutStore()
    navigate('/login')
    toast.success('로그아웃되었습니다.')
  }

  return (
    <header className="app-header bg-surface border-b border-content/10 sticky top-0 z-10">
      <div className="header-inner container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="header-left flex items-center gap-6">
          <Link to="/" className="app-logo text-xl font-bold text-primary tracking-tight">
            GeekYard
          </Link>
          <Link to="/anime" className="nav-link text-content hover:text-primary font-medium transition-colors text-sm">
            애니
          </Link>
        </div>
        <nav className="header-nav flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <Link
                to="/me"
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors group"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.nickname}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-content/10"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center ring-1 ring-primary/30">
                    {user?.nickname?.[0]?.toUpperCase()}
                  </span>
                )}
                <span className="font-semibold text-content group-hover:text-primary transition-colors">
                  {user?.nickname}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="logout-btn text-subtle hover:text-error text-sm font-medium transition-colors px-2 py-1"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-content hover:text-primary font-medium transition-colors px-2 py-1"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="bg-primary text-white px-4 py-1.5 rounded-full font-semibold hover:bg-primary/90 transition-colors text-sm"
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
