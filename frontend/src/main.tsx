import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AdsProvider } from './contexts/AdsContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { AnalyticsProvider } from './contexts/AnalyticsContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AnalyticsProvider>
      <AdsProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </AdsProvider>
    </AnalyticsProvider>
  </React.StrictMode>,
)
