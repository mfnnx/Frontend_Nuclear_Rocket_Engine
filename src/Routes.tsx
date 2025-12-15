export const ROUTES = {
  HOME: '/',
  GASES: '/gases',
  GAS_DETAIL: '/gases/:id',
  IMPULSE_CALCULATION: '/impulse_calculation/:id',
  IMPULSE_CALCULATION_LIST: '/impulse_calculations', // новый
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
}

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  HOME: 'Главная',
  GASES: 'Рабочие газы',
  GAS_DETAIL: 'Подробнее о газе',
  IMPULSE_CALCULATION: 'Расчет импульса',
  IMPULSE_CALCULATION_LIST: 'Мои заявки', // новый
  LOGIN: 'Авторизация',
  REGISTER: 'Регистрация',
  PROFILE: 'Профиль',
}
