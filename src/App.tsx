import type { FC } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store'  // ✅ путь к твоему store
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
import AdminGasesPage from './pages/AdminGasesPage'
import { NotFoundPage } from './pages/ErrorPages/NotFoundPage'
import { ForbiddenPage } from './pages/ErrorPages/ForbiddenPage'
import './App.css'


const AdminRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isModerator = useSelector((state: RootState) => state.user.isModerator)
  
  if (!isModerator) {
    return <Navigate to="/forbidden" replace />
  }
  return <>{children}</>
}

const App: FC = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.GASES} element={<GasesPage />} />
        <Route path="/gases/:id" element={<GasDetailPage />} />
        <Route path="/impulse_calculation/:id" element={<ImpulseCalculationPage />} />
        <Route path={ROUTES.IMPULSE_CALCULATION_LIST} element={<ImpulseCalculationListPage />} />

        <Route 
          path={ROUTES.ADMIN_GASES} 
          element={
            <AdminRoute>
              <AdminGasesPage />
            </AdminRoute>
          } 
        />

        <Route path={ROUTES.LOGIN} element={<AuthPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
