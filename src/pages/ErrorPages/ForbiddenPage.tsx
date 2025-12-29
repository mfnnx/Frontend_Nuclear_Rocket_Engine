import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ShieldLockFill } from 'react-bootstrap-icons';
import './ErrorPages.css';

export const ForbiddenPage = () => {


  return (
    <div className="error-page-container">
      <div className="error-card">
        <div className="error-code">403</div>
        <div className="error-content">
          <div className="error-icon-wrapper">
            <ShieldLockFill size={50} />
          </div>
          <h1 className="error-title">Доступ запрещен</h1>
          <p className="error-desc">
            Этот раздел доступен только модераторам.
          </p>
          <div className="d-flex justify-content-center gap-3">
            
            <Link to="/">
              <Button className="error-btn shadow-sm">
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
