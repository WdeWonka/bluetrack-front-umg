export const ROLES = {
  ADMIN: "admin",
  OPERATOR: "operador",
  SELLER: "vendedor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
