import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { toast } from 'react-toastify'
import { extractApiError } from './global/utils/extractApiError'
import './index.css'
import App from './app/App'

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  const message = extractApiError(event.reason, '알 수 없는 오류가 발생했습니다.')
  toast.error(message)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
