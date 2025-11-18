export const ROUTES = {
  HOME: "/",
  GASES: "/gases", 
  GAS_DETAIL: "/gases/:id",
}

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  GASES: "Рабочие газы",
  GAS_DETAIL: "Подробнее о газе",
};
