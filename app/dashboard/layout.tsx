"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Sidebar from "@/components/sidebar/sidebar";
import Topbar from "@/components/topbar/topbar";
import { useUser } from "@/contexts/user-provider";
import UnreachableServerView from "@/components/views/UnreachableServerView";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { errors, loading, isInitialized } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Servidor inalcanzable
  if (errors?.serverUnreachable) return <UnreachableServerView />;

  // Error desconocido
  if (errors?.unknownError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Error inesperado</h2>
          <p className="text-muted-foreground">
            Ha ocurrido un error. Por favor, intenta de nuevo.
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => router.refresh()}
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  // Skeleton mientras los datos del user cargan o antes del primer montaje
  if (loading || !isMounted || !isInitialized) {
    // Mostrar skeleton según la ruta
    if (pathname === "/dashboard") {
      return <DashboardSkeleton />;
    }

    return <TableSkeleton />;
  }

  // Contenido real
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden bg-[#f4f4f4]">
        <Topbar />
        <main className="flex-1 px-4 py-2 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
