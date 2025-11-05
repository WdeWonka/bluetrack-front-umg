"use client";
import { Card, Skeleton } from "@heroui/react";

export default function TableSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Skeleton - Hidden on mobile/tablet */}
      <div className="hidden lg:flex w-20 bg-white border-r border-gray-200 flex-col items-center py-6 gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex flex-col gap-3 mt-8">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Mobile: Hamburger + Logo */}
          <div className="flex items-center gap-4 lg:hidden">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>

          {/* Desktop: Title */}
          <Skeleton className="hidden lg:block w-24 h-8 rounded-lg" />

          <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Search Bar */}
          <div className="mb-4 md:mb-6">
            <Skeleton className="w-full md:w-80 h-12 rounded-xl" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <Skeleton className="w-full md:w-auto md:flex-1 lg:w-28 h-12 md:h-10 rounded-lg" />
            <Skeleton className="w-full md:w-auto md:flex-1 lg:w-28 h-12 md:h-10 rounded-lg" />
            <Skeleton className="w-full md:w-auto md:flex-1 lg:w-32 h-12 md:h-10 rounded-lg" />
            <Skeleton className="w-full md:w-auto md:flex-1 lg:w-40 h-12 md:h-10 rounded-lg" />
          </div>

          {/* Table Card */}
          <Card className="p-4 md:p-6">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 mb-4">
              <div className="col-span-3 lg:col-span-2">
                <Skeleton className="w-16 h-5 rounded" />
              </div>
              <div className="col-span-9 lg:col-span-3">
                <Skeleton className="w-20 h-5 rounded" />
              </div>
              <div className="hidden lg:block lg:col-span-2">
                <Skeleton className="w-12 h-5 rounded" />
              </div>
              <div className="hidden lg:block lg:col-span-3">
                <Skeleton className="w-32 h-5 rounded" />
              </div>
              <div className="hidden lg:block lg:col-span-2">
                <Skeleton className="w-24 h-5 rounded" />
              </div>
            </div>

            {/* Mobile Header */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 mb-4 md:hidden">
              <div>
                <Skeleton className="w-16 h-5 rounded" />
              </div>
              <div>
                <Skeleton className="w-20 h-5 rounded" />
              </div>
            </div>

            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                {/* Mobile Layout - 2 columns */}
                <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-100 items-center md:hidden">
                  {/* DPI */}
                  <div>
                    <Skeleton className="w-28 h-5 rounded" />
                  </div>

                  {/* Nombre (Avatar + Text) */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex flex-col gap-2 min-w-0">
                      <Skeleton className="w-24 h-4 rounded" />
                      <Skeleton className="w-32 h-3 rounded" />
                    </div>
                  </div>
                </div>

                {/* Tablet Layout - Shows DPI, Nombre, and partial info */}
                <div className="hidden md:grid lg:hidden grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
                  {/* DPI */}
                  <div className="col-span-3">
                    <Skeleton className="w-32 h-5 rounded" />
                  </div>

                  {/* Nombre (Avatar + Text) */}
                  <div className="col-span-9 flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex flex-col gap-2 min-w-0">
                      <Skeleton className="w-32 h-4 rounded" />
                      <Skeleton className="w-40 h-3 rounded" />
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Full table */}
                <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center">
                  {/* DPI */}
                  <div className="col-span-2">
                    <Skeleton className="w-32 h-5 rounded" />
                  </div>

                  {/* Nombre (Avatar + Text) */}
                  <div className="col-span-3 flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="w-32 h-4 rounded" />
                      <Skeleton className="w-40 h-3 rounded" />
                    </div>
                  </div>

                  {/* Rol */}
                  <div className="col-span-2">
                    <Skeleton className="w-20 h-7 rounded-full" />
                  </div>

                  {/* Fecha */}
                  <div className="col-span-3">
                    <Skeleton className="w-24 h-5 rounded" />
                  </div>

                  {/* Acciones */}
                  <div className="col-span-2 flex items-center gap-2 justify-start">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
