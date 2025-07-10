import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/index.css'
import App from './setup/App.tsx'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { LoadingSpinner } from './components/LoadingSpinner.tsx'

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <HelmetProvider>
      <Suspense fallback={<LoadingSpinner/>}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </Suspense>
    </HelmetProvider>
  </StrictMode>,
)
