import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './store'
import './index.css'

// PWA обновление
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration)
      },
      (error) => {
        console.log('SW registration failed: ', error)
      }
    )
  })
}

const basename = import.meta.env.BASE_URL || '/frontend/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={basename}>  
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)