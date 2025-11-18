import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../Routes'
import './BreadCrumbs.css'

interface Crumb {
  label: string;
  path?: string;
}

interface BreadCrumbsProps {
  crumbs: Crumb[];
}

const BreadCrumbs: FC<BreadCrumbsProps> = ({ crumbs }) => {
  return (
    <nav className="breadcrumbs">
      <Link to={ROUTES.HOME}>Главная</Link>
      
      {crumbs.map((crumb, index) => (
        <span key={index} className="breadcrumb-segment">
          <span className="slash">/</span>
          {crumb.path ? (
            <Link to={crumb.path}>{crumb.label}</Link>
          ) : (
            <span className="current">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default BreadCrumbs
