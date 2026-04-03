import { FC, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../../global/components/Layout'
import ProtectedRoute from './ProtectedRoute'

// 공개 페이지
const HomePage = lazy(() => import('../../global/pages/HomePage'))
const LoginPage = lazy(() => import('../../domain/auth/pages/LoginPage'))
const SignUpPage = lazy(() => import('../../domain/auth/pages/SignUpPage'))
const OAuth2CallbackPage = lazy(() => import('../../domain/auth/pages/OAuth2CallbackPage'))
const RestoreAccountPage = lazy(() => import('../../domain/auth/pages/RestoreAccountPage'))
const EmailVerifyPage = lazy(() => import('../../domain/auth/pages/EmailVerifyPage'))

// 애니메
const AnimeListPage = lazy(() => import('../../domain/anime/pages/AnimeListPage'))
const AnimeDetailPage = lazy(() => import('../../domain/anime/pages/AnimeDetailPage'))

// 컬렉션
const CollectionListPage = lazy(() => import('../../domain/animelist/pages/CollectionListPage'))
const CollectionDetailPage = lazy(() => import('../../domain/animelist/pages/CollectionDetailPage'))

// 유저 공개
const UserProfilePage = lazy(() => import('../../domain/user/pages/UserProfilePage'))

// 인증 필요 페이지
const GenreSelectionPage = lazy(() => import('../../domain/anime/pages/GenreSelectionPage'))
const MyPage = lazy(() => import('../../domain/user/pages/MyPage'))
const EditProfilePage = lazy(() => import('../../domain/user/pages/EditProfilePage'))
const ChangePasswordPage = lazy(() => import('../../domain/user/pages/ChangePasswordPage'))
const DeleteAccountPage = lazy(() => import('../../domain/user/pages/DeleteAccountPage'))
const WatchedCalendarPage = lazy(() => import('../../domain/user/pages/WatchedCalendarPage'))
const WatchedStatisticsPage = lazy(() => import('../../domain/user/pages/WatchedStatisticsPage'))

const PageLoader = () => (
  <div className="page-loader flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const AppRouter: FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/email-verify" element={<EmailVerifyPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/restore" element={<RestoreAccountPage />} />
            <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
            <Route path="/users/:username" element={<UserProfilePage />} />
            <Route path="/anime" element={<AnimeListPage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/collections" element={<CollectionListPage />} />
            <Route path="/collections/:id" element={<CollectionDetailPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/genre-selection" element={<GenreSelectionPage />} />
              <Route path="/me" element={<MyPage />} />
              <Route path="/me/edit" element={<EditProfilePage />} />
              <Route path="/me/password" element={<ChangePasswordPage />} />
              <Route path="/me/delete" element={<DeleteAccountPage />} />
              <Route path="/me/watched/calendar" element={<WatchedCalendarPage />} />
              <Route path="/me/watched/statistics" element={<WatchedStatisticsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
