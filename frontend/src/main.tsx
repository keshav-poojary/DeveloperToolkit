import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AdsProvider } from './contexts/AdsContext'
import { FavoritesProvider } from './contexts/FavoritesContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdsProvider>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </AdsProvider>
  </React.StrictMode>,
)
