import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Compass, HouseDoorFill } from 'react-bootstrap-icons';
import './ErrorPages.css';

export const NotFoundPage = () => {
  return (
    <div className="error-page-container">
      <div className="error-card">
        <div className="error-code">404</div>
        <div className="error-content">
          <div className="error-icon-wrapper">
            <Compass size={50} />
          </div>
          <h1 className="error-title">Страница не найдена</h1>
          <p className="error-desc">
            Похоже, мы не можем найти то, что вы ищете.
          </p>
          <Link to="/">
            <Button className="error-btn shadow-sm">
              <HouseDoorFill className="me-2" /> На главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
