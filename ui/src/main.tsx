import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { cleanupExpiredTokens } from "./utils/offerTokens";
import { I18nProvider } from "./i18n/I18nProvider";

cleanupExpiredTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
