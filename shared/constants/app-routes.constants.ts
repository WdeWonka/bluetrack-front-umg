import {
  DASHBOARD,
  STAFF,
  CUSTOMERS,
  WAREHOUSES,
  ORDERS,
  ROUTES,
  PRODUCTS,
} from "./sidebar-keys.constants";

// RUTAS COMPLETAS PARA NAVEGACION
export const AR_DASHBOARD = `/dashboard`;
export const AR_STAFF = `/dashboard/${STAFF}`;
export const AR_CUSTOMERS = `/dashboard/${CUSTOMERS}`;
export const AR_WAREHOUSES = `/dashboard/${WAREHOUSES}`;
export const AR_ORDERS = `/dashboard/${ORDERS}`;
export const AR_ROUTES = `/dashboard/${ROUTES}`;
export const AR_PRODUCTS = `/dashboard/${PRODUCTS}`;

//mapeo ruta completa mas key
export const ROUTE_TO_PAGE = {
  [AR_DASHBOARD]: DASHBOARD,
  [AR_STAFF]: STAFF,
  [AR_CUSTOMERS]: CUSTOMERS,
  [AR_WAREHOUSES]: WAREHOUSES,
  [AR_ORDERS]: ORDERS,
  [AR_ROUTES]: ROUTES,
  [AR_PRODUCTS]: PRODUCTS,
};

export type AppRoute = keyof typeof ROUTE_TO_PAGE;
export type PageKey = (typeof ROUTE_TO_PAGE)[AppRoute];
