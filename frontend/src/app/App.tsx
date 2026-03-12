import { FC, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthStore } from '../domain/auth/store/useAuthStore'
import AppRouter from './routes/AppRouter'

const App: FC = () => {
  const restoreAuth = useAuthStore((state) => state.restoreAuth)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    restoreAuth()
  }, [restoreAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-subtle">로딩 중...</div>
      </div>
    )
  }

  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable={false}
      />
    </>
  )
}

export default App
