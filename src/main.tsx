import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './store'
import './index.css'

declare global {
  interface Window {
    __TAURI__?: any
  }
}

const isTauri = window.__TAURI__ !== undefined
const basename = isTauri ? undefined : import.meta.env.BASE_URL



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={basename}>  
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)