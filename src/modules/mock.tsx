import type { Gas } from '../types'

export const GASES_MOCK: Gas[] = [
  {
    id: 1,
    title: "Водород (H₂)",
    description: "Самый лёгкий и распространённый элемент. В ядерном ракетном двигателе обеспечивает высокий удельный импульс.",
    imageURL: "http://localhost:9000/img/H.png",
    molarMass: 2.016
  },
  {
    id: 2,
    title: "Гелий (He)",
    description: "Инертный газ, безопасный и удобный в хранении, но даёт меньший импульс по сравнению с водородом.",
    imageURL: "http://localhost:9000/img/He.png",
    molarMass: 4.0026
  },
  {
    id: 3,
    title: "Аргон (Ar)",
    description: "Тяжёлый газ, легко хранится, но скорость истечения ниже.",
    imageURL: "http://localhost:9000/img/Ar.png",
    molarMass: 39.948
  },
  {
    id: 4,
    title: "Ксенон (Xe)",
    description: "Очень тяжёлый газ, удобен для электроракетных двигателей, но в NTR даёт низкий импульс.",
    imageURL: "http://localhost:9000/img/Xe.png",
    molarMass: 131.293
  },
  {
  id: 5,
    title: "Азот (N₂)",
    description: "В ядерном ракетном двигателе азот используют главным образом как вспомогательный газ, а не как рабочее тело.",
    imageURL: "http://localhost:9000/img/N.webp",
    molarMass: 28.013
  },
  {
    id: 6,
    title: "Неон (Ne)",
    description: "Компромисс по характеристикам между лёгкостью и простотой хранения.",
    imageURL: "http://localhost:9000/img/Ne.png",
    molarMass: 20.179
  },
]
