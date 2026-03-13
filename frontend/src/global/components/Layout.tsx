import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'

const Layout: FC = () => {
  return (
    <div className="app-layout min-h-screen bg-background">
      <Header />
      <main className="app-main container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
