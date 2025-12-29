export const ROUTES = {
  HOME: '/',
  GASES: '/gases',
  GAS_DETAIL: '/gases/:id',
  IMPULSE_CALCULATION: '/impulse_calculation/:id',
  IMPULSE_CALCULATION_LIST: '/impulse_calculations',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ADMIN_GASES: '/admin/gases',
  // Новые роуты для ошибок
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/not-found'
}

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  HOME: 'Главная',
  GASES: 'Рабочие газы',
  GAS_DETAIL: 'Подробнее о газе',
  IMPULSE_CALCULATION: 'Расчет импульса',
  IMPULSE_CALCULATION_LIST: 'Мои заявки',
  LOGIN: 'Авторизация',
  REGISTER: 'Регистрация',
  PROFILE: 'Профиль',
  ADMIN_GASES: 'Редактирование газов',
  FORBIDDEN: 'Доступ запрещен',
  NOT_FOUND: 'Страница не найдена'
}
