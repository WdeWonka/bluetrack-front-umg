import { SidebarItem } from "./types/sidebar";

import {
  AR_DASHBOARD,
  AR_STAFF,
  AR_CUSTOMERS,
  AR_WAREHOUSES,
  AR_ORDERS,
  AR_ROUTES,
  AR_PRODUCTS,
} from "@/shared/constants/app-routes.constants";
import {
  DASHBOARD,
  STAFF,
  CUSTOMERS,
  WAREHOUSES,
  ORDERS,
  ROUTES,
  PRODUCTS,
} from "@/shared/constants/sidebar-keys.constants";
import { ROLES } from "@/shared/constants/roles.constant";

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    key: DASHBOARD,
    label: "Dashboard",
    pathname: AR_DASHBOARD,
    icon: "home-simple-door",
    permissions: [ROLES.ADMIN, ROLES.OPERATOR],
  },
  {
    key: STAFF,
    label: "Staff",
    pathname: AR_STAFF,
    icon: "group",
    permissions: [ROLES.ADMIN],
  },
  {
    key: CUSTOMERS,
    label: "Clientes",
    pathname: AR_CUSTOMERS,
    icon: "community",
    permissions: [ROLES.ADMIN, ROLES.OPERATOR],
  },
  {
    key: WAREHOUSES,
    label: "Almacenes",
    pathname: AR_WAREHOUSES,
    icon: "garage",
    permissions: [ROLES.ADMIN],
  },
  {
    key: PRODUCTS,
    label: "Productos",
    pathname: AR_PRODUCTS,
    icon: "box-iso",
    permissions: [ROLES.ADMIN],
  },
  {
    key: ORDERS,
    label: "Órdenes",
    pathname: AR_ORDERS,
    icon: "truck",
    permissions: [ROLES.ADMIN, ROLES.OPERATOR],
  },
  {
    key: ROUTES,
    label: "Rutas",
    pathname: AR_ROUTES,
    icon: "map",
    permissions: [ROLES.ADMIN, ROLES.OPERATOR],
  },
];
