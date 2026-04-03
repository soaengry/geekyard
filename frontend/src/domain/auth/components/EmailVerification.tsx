import { FC, useState } from 'react'
import { toast } from 'react-toastify'
import { sendVerificationEmail } from '../api/authApi'

interface EmailVerificationProps {
  email: string
  isEmailValid: boolean
  onVerified?: () => void
}

const EmailVerification: FC<EmailVerificationProps> = ({ email, isEmailValid }) => {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = async () => {
    if (!isEmailValid || !email) return
    setIsSending(true)
    try {
      await sendVerificationEmail(email)
      setStatus('sent')
      toast.success('인증 메일이 발송되었습니다.')
    } catch {
      toast.error('인증 메일 발송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  if (status === 'sent') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-subtle">
          <span className="font-medium text-content">{email}</span>로 인증 메일을 발송했습니다.
          <br />
          메일함을 확인하고 링크를 클릭하면 인증이 완료됩니다.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-sm text-primary hover:underline"
        >
          다시 받기
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSendEmail}
      disabled={!isEmailValid || isSending}
      className="text-sm px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-40 transition-colors"
    >
      {isSending ? '발송 중...' : '인증 메일 발송'}
    </button>
  )
}

export default EmailVerification
