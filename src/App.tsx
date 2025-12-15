import type { FC } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './Routes'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import GasesPage from './pages/GasesPage'
import GasDetailPage from './pages/GasDetailPage'
import AuthPage from './pages/AuthPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ImpulseCalculationPage from './pages/ImpulseCalculationPage'
import ImpulseCalculationListPage from './pages/ImpulseCalculationListPage'
import './App.css'

const App: FC = () => {
  return (
    <>
      <Header />
      <Routes>
        {/* Главная страница */}
        <Route path={ROUTES.HOME} element={<HomePage />} />

        {/* Страницы пользователя */}
        <Route path={ROUTES.GASES} element={<GasesPage />} />
        <Route path="/gases/:id" element={<GasDetailPage />} />
        <Route path="/impulse_calculation/:id" element={<ImpulseCalculationPage />} />
        <Route
          path={ROUTES.IMPULSE_CALCULATION_LIST}
          element={<ImpulseCalculationListPage />}
        />

        {/* Аутентификация и профиль */}
        <Route path={ROUTES.LOGIN} element={<AuthPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
      </Routes>
    </>
  )
}

export default App
