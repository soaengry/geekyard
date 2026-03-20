import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

const Layout: FC = () => {
  return (
    <div className="app-layout min-h-screen bg-background">
      <Header />
      <main className="app-main container mx-auto px-4 py-8 pb-20 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
