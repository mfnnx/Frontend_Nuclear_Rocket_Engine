import type { FC } from 'react'
import './HomePage.css'

const HomePage: FC = () => {
  return (
    <main className="container home">
      <div className="page-head">
        <h1 className="page-title">Ядерные ракетные двигатели</h1>
      </div>
      
      <div className="home-content">
        <p className="home-description">
          Добро пожаловать в сервис расчета импульса ядерных ракетных двигателей!
          Здесь вы можете выбрать рабочие газы для расчета.
        </p>
      </div>
    </main>
  )
}

export default HomePage
