import type { FC } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './Routes'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import GasesPage from './pages/GasesPage'
import GasDetailPage from './pages/GasDetailPage'
import './App.css'

const App: FC = () => {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.GASES} element={<GasesPage />} />
        <Route path={ROUTES.GAS_DETAIL} element={<GasDetailPage />} />
      </Routes>
    </div>
  )
}

export default App
