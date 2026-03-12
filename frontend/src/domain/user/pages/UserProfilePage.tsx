import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { getUserProfile } from '../../auth/api/authApi'
import { UserProfileResponse } from '../../auth/types'

const UserProfilePage: FC = () => {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return

    getUserProfile(username)
      .then(({ data }) => setProfile(data.data))
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true)
        }
      })
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return <div className="text-center py-10 text-gray-500">로딩 중...</div>
  }

  if (notFound || !profile) {
    return <div className="text-center py-10 text-gray-500">사용자를 찾을 수 없습니다.</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6">
        {profile.profileImage && (
          <img
            src={profile.profileImage}
            alt="프로필 이미지"
            className="w-20 h-20 rounded-full mb-4 object-cover"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-900">{profile.nickname}</h1>
        <p className="text-gray-500 text-sm">@{profile.username}</p>
        {profile.bio && (
          <p className="mt-4 text-gray-700">{profile.bio}</p>
        )}
      </div>
    </div>
  )
}

export default UserProfilePage
