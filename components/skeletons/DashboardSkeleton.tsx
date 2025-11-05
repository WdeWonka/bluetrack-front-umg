"use client";
import { Card, Skeleton } from "@heroui/react";

export default function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col">
        {/* Navbar Skeleton */}
        <NavbarSkeleton />

        {/* Dashboard Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header con título y botones */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-muted animate-pulse rounded-md" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 bg-muted animate-pulse rounded-md" />
              <Skeleton className="h-10 w-32 bg-muted animate-pulse rounded-md" />
            </div>
          </div>

          {/* Cards de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card rounded-lg border p-6 space-y-3">
                <Skeleton className="h-4 w-24 bg-muted animate-pulse rounded" />
                <Skeleton className="h-8 w-32 bg-muted animate-pulse rounded" />
                <Skeleton className="h-3 w-full bg-muted animate-pulse rounded" />
              </Card>
            ))}
          </div>

          {/* Tabla/Lista */}
          <div className="bg-card rounded-lg border">
            {/* Header de tabla */}
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-40 bg-muted animate-pulse rounded" />
            </div>

            {/* Filas de tabla */}
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <Skeleton className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                  <Skeleton className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavbarSkeleton() {
  return (
    <nav className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
          <Skeleton className="h-6 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Menú central */}
        <div className="hidden md:flex gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-5 w-20 bg-muted animate-pulse rounded"
            />
          ))}
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Skeleton className="h-4 w-24 bg-muted animate-pulse rounded mb-1" />
            <Skeleton className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
          <Skeleton className="h-10 w-10 bg-muted animate-pulse rounded-full" />
        </div>
      </div>
    </nav>
  );
}
