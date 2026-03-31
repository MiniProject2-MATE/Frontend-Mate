import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './styles/theme'
import './index.css'
import App from './App.jsx'

async function enableMocking() {
  // 개발 환경이 아니면 모킹 미사용
  if (import.meta.env.MODE !== 'development') {
    return
  }

  try {
    // MSW 브라우저 워커 가져오기
    const { worker } = await import('./mocks/browser')
    
    // 워커 시작
    return await worker.start({
      onUnhandledRequest: 'bypass', // 모킹되지 않은 주소는 실제 네트워크 요청 허용
    })
  } catch (error) {
    console.error('MSW 초기화 실패:', error)
    // 실패하더라도 앱 실행은 계속 진행하기 위해 에러를 던지지 않음
  }
}

// 모킹 설정 후 앱 렌더링
enableMocking().finally(() => {
  const container = document.getElementById('root')
  if (container) {
    createRoot(container).render(
      <StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </StrictMode>,
    )
  }
})
