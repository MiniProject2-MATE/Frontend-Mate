import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
=======
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './styles/theme'
>>>>>>> feature/theme-setup
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
<<<<<<< HEAD
    <App />
=======
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
>>>>>>> feature/theme-setup
  </StrictMode>,
)
