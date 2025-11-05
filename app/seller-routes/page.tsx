"use client";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateValue } from "@internationalized/date";
import { parseLocalDate, formatLocalDate } from "@/shared/utils/date";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Calendar as HeroCalendar,
  useDisclosure,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

import useSellerRoutes, {
  type RouteListItem,
} from "@/app/seller-routes/hooks/useSellerRoutes";
import { useUser } from "@/contexts/user-provider";
import { RouteDetailModal } from "@/app/seller-routes/components/routeDetailModal";

type Ruta = {
  id: string;
  title: string;
  start: string;
  end: string;
  descripcion: string;
  color?: string;
  routeData?: RouteListItem;
};

const getColorByEstado = (estado: string): string => {
  switch (estado) {
    case "pendiente":
      return "#93c5fd";
    case "en_proceso":
      return "#fbbf24";
    case "completada":
      return "#86efac";
    default:
      return "#c084fc";
  }
};

export default function TestCalendar() {
  const [selectedRoute, setSelectedRoute] = useState<RouteListItem | null>(
    null
  );
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { user, loading: userLoading, isInitialized } = useUser();

  const {
    routes,
    loading: routesLoading,
    error,
    totalRoutes,
    isReady,
    refetch,
  } = useSellerRoutes({
    vendedor_id: user?.id,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rutasFormateadas = useMemo<Ruta[]>(() => {
    if (!routes || routes.length === 0) {
      return [];
    }

    return routes.map((ruta: RouteListItem) => ({
      id: String(ruta.id),
      title: ruta.nombre,
      start: ruta.fecha,
      end: ruta.fecha,
      descripcion: `${ruta.total_clientes} clientes - Estado: ${ruta.estado}`,
      color: getColorByEstado(ruta.estado),
      routeData: ruta,
    }));
  }, [routes]);

  const handleEventClick = (info: EventClickArg) => {
    const ruta = rutasFormateadas.find((r) => r.id === info.event.id);
    if (ruta?.routeData) {
      setSelectedRoute(ruta.routeData);
      onRouteModalOpen(); // Abrir el modal
    }
  };

  const {
    isOpen: isRouteModalOpen,
    onOpen: onRouteModalOpen,
    onOpenChange: onRouteModalOpenChange,
  } = useDisclosure();

  const handleExportSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const goToPreviousMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
  };

  const goToNextMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
  };

  const getRutasDelDia = useMemo(() => {
    return (date: Date): Ruta[] => {
      const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return rutasFormateadas.filter((ruta) => ruta.start === localDateStr);
    };
  }, [rutasFormateadas]);

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const goToPreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const formatMobileDate = (date: Date): string => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  };

  // Convertir Date a DateValue para HeroUI Calendar
  const getDateValue = (date: Date): DateValue => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return parseDate(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  };

  // Manejar cambio de fecha del HeroUI Calendar
  const handleCalendarChange = (date: DateValue) => {
    const newDate = new Date(date.year, date.month - 1, date.day);
    setSelectedDate(newDate);
  };

  const rutasDelDia = getRutasDelDia(selectedDate);
  const isLoading = userLoading || !isInitialized || (isReady && routesLoading);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-full bg-transparent px-6 pt-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          No se pudo cargar la información del usuario. Por favor, recarga la
          página.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-full bg-transparent px-6 pt-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error al cargar las rutas. Por favor, intenta de nuevo.
        </div>
      </div>
    );
  }

  // 📱 VISTA MÓVIL
  if (isMobile) {
    return (
      <div className="w-full min-h-full bg-transparent px-4 pt-3 pb-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              aria-label="Día anterior"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={goToPreviousDay}
            >
              <NavArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 text-center capitalize">
              {formatMobileDate(selectedDate)}
            </h2>

            <button
              aria-label="Día siguiente"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={goToNextDay}
            >
              <NavArrowRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-2 mb-4">
            {totalRoutes}{" "}
            {totalRoutes === 1 ? "ruta asignada" : "rutas asignadas"}
          </p>

          {/* Mini calendario de HeroUI */}
          <div className="bg-white rounded-lg border border-gray-200 p-2 mb-4">
            <style jsx global>{`
              .mobile-mini-calendar {
                max-width: 100%;
              }
              .mobile-mini-calendar table {
                font-size: 0.875rem;
              }
              .mobile-mini-calendar button {
                min-width: 32px;
                height: 32px;
                font-size: 0.875rem;
              }
              .mobile-mini-calendar [data-slot="header"] {
                padding: 0.5rem 0;
              }
              .mobile-mini-calendar [data-slot="grid-wrapper"] {
                padding: 0.25rem 0;
              }
            `}</style>
            <div className="mobile-mini-calendar">
              <HeroCalendar
                aria-label="Seleccionar fecha"
                value={getDateValue(selectedDate)}
                onChange={handleCalendarChange}
                classNames={{
                  base: "w-full",
                  content: "w-full",
                }}
                color="primary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rutasDelDia.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 text-sm">
                No hay rutas programadas para este día
              </p>
            </div>
          ) : (
            rutasDelDia.map((ruta) => (
              <button
                key={ruta.id}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow text-left"
                onClick={() => {
                  setSelectedRoute(ruta.routeData ?? null);
                  onRouteModalOpen(); // Abrir el modal
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedRoute(ruta.routeData ?? null);
                    onRouteModalOpen(); // Abrir el modal
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 h-16 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ruta.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {ruta.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {ruta.descripcion}
                    </p>
                    {ruta.routeData && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ruta.routeData.estado === "pendiente"
                              ? "bg-blue-100 text-blue-700"
                              : ruta.routeData.estado === "en_proceso"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ruta.routeData.estado === "en_proceso"
                            ? "En proceso"
                            : ruta.routeData.estado.charAt(0).toUpperCase() +
                              ruta.routeData.estado.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal de detalle de ruta */}
        <RouteDetailModal
          isOpen={isRouteModalOpen}
          onOpenChange={onRouteModalOpenChange}
          routeData={selectedRoute}
          onRouteUpdated={handleExportSuccess}
        />
      </div>
    );
  }

  // 🖥️ VISTA DESKTOP
  return (
    <div className="w-full h-screen overflow-y-auto flex flex-col bg-transparent px-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <h1
            className="text-2xl font-semibold text-gray-800"
            id="calendar-title"
          >
            Calendario de Rutas
          </h1>
          <div className="flex items-center gap-1">
            <button
              aria-label="Mes anterior"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={goToPreviousMonth}
            >
              <NavArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              aria-label="Mes siguiente"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={goToNextMonth}
            >
              <NavArrowRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium">{totalRoutes}</span>{" "}
          {totalRoutes === 1 ? "ruta" : "rutas"}
        </div>
      </div>

      <div className="calendar-container flex-1 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          headerToolbar={false}
          events={rutasFormateadas}
          eventClick={handleEventClick}
          height="100%"
          fixedWeekCount={false}
          showNonCurrentDates={true}
          dayMaxEvents={false}
          displayEventTime={false}
          eventDisplay="block"
          dayHeaderFormat={{ weekday: "long" }}
          datesSet={(dateInfo) => {
            const title = document.getElementById("calendar-title");
            if (title) {
              const date = dateInfo.view.currentStart;
              const formatter = new Intl.DateTimeFormat("es-ES", {
                month: "long",
                year: "numeric",
              });
              title.textContent =
                formatter.format(date).charAt(0).toUpperCase() +
                formatter.format(date).slice(1);
            }
          }}
        />
      </div>

      {/* Modal de detalle de ruta */}
      <RouteDetailModal
        isOpen={isRouteModalOpen}
        onOpenChange={onRouteModalOpenChange}
        routeData={selectedRoute}
        onRouteUpdated={handleExportSuccess}
      />

      <style jsx>{`
        .calendar-container {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          position: relative;
        }

        .calendar-container :global(.fc) {
          height: 100% !important;
        }

        .calendar-container :global(.fc-view-harness) {
          height: 100% !important;
        }

        .calendar-container :global(.fc-theme-standard td),
        .calendar-container :global(.fc-theme-standard th) {
          border-color: #e5e7eb;
        }

        .calendar-container :global(.fc-col-header-cell) {
          background-color: #f9fafb;
          padding: 12px 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
          text-transform: capitalize;
          border-bottom: 2px solid #e5e7eb;
        }

        .calendar-container :global(.fc-daygrid-day) {
          background-color: white;
          transition: background-color 0.2s;
        }

        .calendar-container :global(.fc-daygrid-day:hover) {
          background-color: #f9fafb;
        }

        .calendar-container :global(.fc-daygrid-day.fc-day-other) {
          background-color: #fafafa;
        }

        .calendar-container :global(.fc-daygrid-day-number) {
          padding: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .calendar-container
          :global(.fc-daygrid-day.fc-day-other .fc-daygrid-day-number) {
          color: #9ca3af;
        }

        .calendar-container :global(.fc-daygrid-day.fc-day-today) {
          background-color: white !important;
        }

        .calendar-container
          :global(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
          background-color: #3b82f6;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .calendar-container :global(.fc-event) {
          border: none !important;
          border-radius: 6px;
          padding: 6px 10px;
          margin: 3px 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .calendar-container :global(.fc-event:hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .calendar-container :global(.fc-event-title) {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
        }

        .calendar-container :global(.fc-daygrid-day-events) {
          margin-top: 4px;
          margin-bottom: 2px;
        }

        .calendar-container :global(.fc-daygrid-day-frame) {
          min-height: 85px;
          display: flex;
          flex-direction: column;
        }

        .calendar-container :global(.fc-scrollgrid) {
          border-collapse: collapse !important;
          height: 100% !important;
        }

        .calendar-container :global(.fc-scrollgrid-sync-table) {
          height: 100% !important;
        }

        .calendar-container :global(.fc-daygrid-body) {
          width: 100% !important;
        }

        .calendar-container :global(.fc-scroller) {
          overflow: hidden !important;
        }

        .calendar-container :global(.fc-scroller-liquid-absolute) {
          position: static !important;
        }

        .calendar-container
          :global(.fc-daygrid-body-unbalanced .fc-daygrid-day-frame) {
          min-height: 85px;
        }
      `}</style>
    </div>
  );
}
