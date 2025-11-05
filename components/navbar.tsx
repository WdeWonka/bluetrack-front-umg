// components/navbar.tsx
"use client";

import { useUser } from "@/contexts/user-provider";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <nav className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">D</span>
          </div>
          <h1 className="text-xl font-bold">DeliverIt</h1>
        </div>

        {/* Menú central */}
        <div className="hidden md:flex items-center gap-6">
          <a
            className="text-sm font-medium hover:text-primary"
            href="/dashboard"
          >
            Dashboard
          </a>
          <a className="text-sm font-medium hover:text-primary" href="/routes">
            Rutas
          </a>
          <a className="text-sm font-medium hover:text-primary" href="/orders">
            Órdenes
          </a>
          <a
            className="text-sm font-medium hover:text-primary"
            href="/customers"
          >
            Clientes
          </a>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          {loading ? (
            // Skeleton del usuario
            <>
              <div className="hidden md:block space-y-1">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
            </>
          ) : user ? (
            // Usuario cargado
            <>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.nombre}</p>
                <p className="text-xs text-muted-foreground">{user.rol}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
