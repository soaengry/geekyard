import { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollDirection } from '../hooks/useScrollDirection'

interface NavItem {
  path: string
  label: string
  icon: FC<{ active: boolean }>
}

const HomeIcon: FC<{ active: boolean }> = ({ active }) => (
  <svg className={`bottom-nav-icon w-6 h-6 ${active ? 'text-primary' : 'text-subtle'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
  </svg>
)

const AnimeIcon: FC<{ active: boolean }> = ({ active }) => (
  <svg className={`bottom-nav-icon w-6 h-6 ${active ? 'text-primary' : 'text-subtle'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
  </svg>
)

const ListIcon: FC<{ active: boolean }> = ({ active }) => (
  <svg className={`bottom-nav-icon w-6 h-6 ${active ? 'text-primary' : 'text-subtle'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const MyPageIcon: FC<{ active: boolean }> = ({ active }) => (
  <svg className={`bottom-nav-icon w-6 h-6 ${active ? 'text-primary' : 'text-subtle'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '홈', icon: HomeIcon },
  { path: '/anime', label: '애니', icon: AnimeIcon },
  { path: '/collections', label: '리스트', icon: ListIcon },
  { path: '/me', label: '마이', icon: MyPageIcon },
]

const BottomNav: FC = () => {
  const location = useLocation()
  const scrollDirection = useScrollDirection()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={`bottom-nav fixed bottom-0 left-0 right-0 z-10 bg-surface border-t border-content/10 md:hidden transition-transform duration-300 ${
        scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="bottom-nav-inner flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-primary' : 'text-subtle'
              }`}
            >
              <Icon active={active} />
              <span className={`bottom-nav-label text-[10px] font-medium ${active ? 'text-primary' : 'text-subtle'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
