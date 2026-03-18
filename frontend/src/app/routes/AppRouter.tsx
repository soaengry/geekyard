import { FC } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../../global/components/Layout'
import { HomePage } from '../../global/pages'
import {
  LoginPage,
  SignUpPage,
  OAuth2CallbackPage,
  RestoreAccountPage,
  EmailVerifyPage,
} from '../../domain/auth/pages'
import {
  MyPage,
  EditProfilePage,
  ChangePasswordPage,
  DeleteAccountPage,
  UserProfilePage,
} from '../../domain/user/pages'
import { AnimeListPage, AnimeDetailPage, GenreSelectionPage } from '../../domain/anime'
import { CollectionListPage, CollectionDetailPage } from '../../domain/animelist'
import ProtectedRoute from './ProtectedRoute'

const AppRouter: FC = () => {
  return (
    <BrowserRouter>
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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
