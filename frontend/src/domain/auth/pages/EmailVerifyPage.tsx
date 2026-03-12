import { FC, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verifyEmailToken } from '../api/authApi'

type Status = 'loading' | 'success' | 'error'

const EmailVerifyPage: FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      return
    }

    verifyEmailToken(token)
      .then(() => {
        setStatus('success')
        setTimeout(() => window.close(), 2000)
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-8 py-12 bg-surface rounded-2xl shadow-sm border border-content/10 max-w-sm w-full mx-4">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-content font-medium">인증 중...</p>
            <p className="text-subtle text-sm mt-1">잠시만 기다려주세요</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-content font-semibold text-lg">이메일 인증 완료</p>
            <p className="text-subtle text-sm mt-2">이 창은 자동으로 닫힙니다.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-content font-semibold text-lg">인증 실패</p>
            <p className="text-subtle text-sm mt-2">링크가 만료되었거나 유효하지 않습니다.</p>
            <button
              onClick={() => window.close()}
              className="mt-6 text-sm px-4 py-2 bg-surface border border-content/20 rounded-lg text-content hover:bg-background transition-colors"
            >
              창 닫기
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default EmailVerifyPage
