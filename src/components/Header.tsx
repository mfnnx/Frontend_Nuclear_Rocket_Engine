import type { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import './Header.css'

const Header: FC = () => {
  const location = useLocation()

  return (
    <header className="topbar">
      <div className="inner">
        <Link to={ROUTES.HOME} className="brand">
          <img src="/logo.svg" className="logo" alt="UNIVERSE" />
        </Link>
        <nav className="nav">
          <Link 
            to={ROUTES.HOME}
            className={location.pathname === ROUTES.HOME ? 'nav-link active' : 'nav-link'}
          >
            {ROUTE_LABELS.HOME}
          </Link>
          <Link 
            to={ROUTES.GASES}
            className={location.pathname === ROUTES.GASES ? 'nav-link active' : 'nav-link'}
          >
            {ROUTE_LABELS.GASES}
          </Link>
        </nav>
      </div>
      <div className="site-header"></div>
    </header>
  )
}

export default Header
