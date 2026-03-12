import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { deleteAccount } from '../../auth/api/authApi'

const DeleteAccountPage: FC = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

    setIsDeleting(true)
    try {
      await deleteAccount()
      logout()
      toast.success('계정이 삭제되었습니다.')
      navigate('/')
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error('계정 삭제에 실패했습니다.')
      }
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold text-content mb-6">계정 삭제</h1>
      <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6">
        <div className="bg-error/10 border border-error/20 rounded-md p-4 mb-6">
          <p className="text-error font-medium text-sm mb-2">주의사항</p>
          <ul className="text-error text-sm space-y-1 list-disc list-inside opacity-80">
            <li>계정 삭제 후 모든 데이터가 삭제됩니다.</li>
            <li>30일 이내에 계정 복구가 가능합니다.</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/me')}
            className="flex-1 border border-content/20 text-content rounded-md py-2 hover:bg-background transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-error text-white rounded-md py-2 hover:bg-error/90 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? '삭제 중...' : '계정 삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountPage
