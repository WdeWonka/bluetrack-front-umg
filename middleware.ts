// middleware.ts
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/unauthorized"];
const DASHBOARD_PATH = "/dashboard";
const SELLER_PATH = "/seller-routes"; // ✅ Ruta correcta para vendedores

// JWT Secret (debe coincidir con tu backend)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY ||
    process.env.NEXT_PUBLIC_JWT_SECRET ||
    "your-secret-key",
);

// ✅ Definir permisos según tu sidebar
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Dashboard - Admin y Operador
  "/dashboard": ["admin", "operador"],

  // Staff - Solo Admin
  "/dashboard/staff": ["admin"],

  // Clientes - Admin y Operador
  "/dashboard/customers": ["admin", "operador"],

  // Almacenes - Solo Admin
  "/dashboard/warehouses": ["admin"],

  // Productos - Solo Admin
  "/dashboard/products": ["admin"],

  // Órdenes - Admin y Operador
  "/dashboard/orders": ["admin", "operador"],

  // Rutas - Admin y Operador
  "/dashboard/routes": ["admin", "operador"],

  // Rutas de Vendedor - Solo Vendedor
  "/seller-routes": ["vendedor"],
};

/**
 * Middleware de autenticación y autorización mejorado
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir assets estáticos y API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Verificar si hay token en cookies
  const token = request.cookies.get("auth_token")?.value;
  const pendingRedirect = request.cookies.get("pending_redirect")?.value;

  // === USUARIO SIN TOKEN (No autenticado) ===
  if (!token) {
    // Si está intentando acceder a una ruta protegida
    if (!PUBLIC_PATHS.includes(pathname)) {
      console.log(`[Middleware] No token found, saving redirect: ${pathname}`);

      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);

      // 🔑 Guardar la URL a la que intentaba acceder
      if (pathname !== "/") {
        response.cookies.set("pending_redirect", pathname, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 10, // 10 minutos
          path: "/",
        });
      }

      return response;
    }

    // Si está en login sin token, permitir acceso
    return NextResponse.next();
  }

  // === USUARIO CON TOKEN (Autenticado) ===

  // 3. Verificar y decodificar el token para obtener el rol
  let userRole: string;
  let userId: number;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    userRole = (payload.rol as string) || "operador";
    userId = payload.userId as number;
  } catch (error) {
    // Token inválido, limpiar y redirigir a login
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("auth_token");
    response.cookies.delete("pending_redirect");

    return response;
  }

  // 4. Si está en la raíz, redirigir según el rol
  if (pathname === "/") {
    // ✅ Vendedores van a /seller-routes, otros a /dashboard
    const redirectPath = userRole === "vendedor" ? SELLER_PATH : DASHBOARD_PATH;

    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    response.cookies.delete("pending_redirect");

    return response;
  }

  // 5. Si está en login con token válido (ya autenticado)
  if (pathname === "/login") {
    let redirectPath = userRole === "vendedor" ? SELLER_PATH : DASHBOARD_PATH;

    // 🔑 Si hay un redirect pendiente, validar que sea para su rol
    if (pendingRedirect && isValidRedirectPath(pendingRedirect)) {
      const allowedRoles = getRoutePermissions(pendingRedirect);
    }

    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    response.cookies.delete("pending_redirect");

    return response;
  }

  // 6. Verificar permisos de ruta según el rol
  const allowedRoles = getRoutePermissions(pathname);

  if (!allowedRoles.includes(userRole)) {
    // Redirigir al dashboard correspondiente según su rol
    const redirectPath = userRole === "vendedor" ? SELLER_PATH : DASHBOARD_PATH;
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    return response;
  }

  // Token existe y tiene permisos, continuar normalmente
  const response = NextResponse.next();

  // Headers de seguridad
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Limpiar pending_redirect si hay uno
  if (pendingRedirect) {
    response.cookies.delete("pending_redirect");
  }

  return response;
}

/**
 * Obtiene los roles permitidos para una ruta específica
 * ✅ Basado en tu configuración del sidebar
 */
function getRoutePermissions(pathname: string): string[] {
  // Primero buscar match exacto
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Buscar match por prefijo para rutas dinámicas
  // Ejemplo: /dashboard/staff/123 → match con /dashboard/staff
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + "/")) {
      return roles;
    }
  }

  // ✅ Si es una ruta bajo /seller-routes/* → solo vendedor
  if (pathname.startsWith("/seller-routes")) {
    return ["vendedor"];
  }

  // ✅ Si es una ruta bajo /dashboard/* no definida → admin y operador por defecto
  if (pathname.startsWith("/dashboard")) {
    return ["admin", "operador"];
  }

  // Rutas públicas
  if (PUBLIC_PATHS.includes(pathname)) {
    return ["admin", "operador", "vendedor"];
  }

  // Por defecto, solo admin tiene acceso
  return ["admin"];
}

/**
 * Valida que el redirect path sea seguro
 */
function isValidRedirectPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    path !== "/" &&
    path !== "/login" &&
    !path.includes("..") && // Prevenir path traversal
    !PUBLIC_PATHS.includes(path)
  );
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
