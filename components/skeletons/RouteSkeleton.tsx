// components/RouteSkeleton.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function RouteSkeleton() {
  const pathname = usePathname();

  useEffect(() => {
    console.log("[RouteSkeleton] mounted, pathname:", pathname);
  }, [pathname]);

  // Exact match for dashboard root
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return <DashboardSkeleton />;
  }

  // Any subroute under /dashboard
  if (pathname?.startsWith("/dashboard")) {
    return <TableSkeleton />;
  }

  // Fallback - por si acaso
  return <TableSkeleton />;
}
