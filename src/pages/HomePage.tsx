import type { FC } from 'react'
import { Container } from 'react-bootstrap'
import './HomePage.css'
import { getAsset } from '../utils/path'

const HomePage: FC = () => {
  return (
    <Container className="home-with-video">
      {/* Видео только внутри контейнера */}
      <div className="video-container">
        <video
          className="home-video"
          src={getAsset('background.mp4')}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      
      {/* Ваш контент */}
      <div className="page-head">
        <h1 className="page-title">Ядерные ракетные двигатели</h1>
      </div>
      
      <div className="home-content">
        <p className="home-description">
          Добро пожаловать в сервис расчета импульса ядерных ракетных двигателей!
          Здесь вы можете выбрать рабочие газы для расчета.
        </p>
      </div>
    </Container>
  )
}

export default HomePage