import { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../domain/auth/store/useAuthStore'

const ProtectedRoute: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
