import type { FC } from 'react'
import { Container } from 'react-bootstrap'
import './HomePage.css'

const HomePage: FC = () => {
  return (
    <Container className="home-with-video">
      <div className="video-container">
        <video
          className="home-video"
          src='background.mp4'
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      
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