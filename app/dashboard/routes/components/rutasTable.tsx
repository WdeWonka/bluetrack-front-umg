"use client";
import type { RouteListItem } from "../hooks/useRoutes";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { NavArrowDown, ShareIos, Map, MinusCircle } from "iconoir-react";

import useRoutes from "../hooks/useRoutes";
import { CreateRouteModal } from "../components/createRouteModal";

import { ExportModal } from "./exportModal";
import { SeeRouteModal } from "./seeRouteModal";
import { CancelRouteModal } from "./cancelRouteModal";

import { EyeIcon } from "@/components/icons";

// Columnas de la tabla
export const columns = [
  { name: "NOMBRE", uid: "nombre" },
  { name: "VENDEDOR ASIGNADO", uid: "vendedor_nombre" },
  { name: "PUNTO DE PARTIDA", uid: "almacen_nombre" },
  { name: "FECHA DE SALIDA", uid: "fecha" },
  { name: "ESTADO", uid: "estado" },
  { name: "CLIENTES", uid: "total_clientes" },
  { name: "ACCIONES", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "nombre",
  "vendedor_nombre",
  "almacen_nombre",
  "fecha",
  "estado",
  "total_clientes",
  "actions",
];

function capitalizeName(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return word;

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export default function RoutesTable() {
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const {
    routes,
    loading,
    paginationConfig,
    updateCurrentPage,
    error,
    refetch,
  } = useRoutes({ initialPage: 1 });

  const {
    isOpen: isExportModalOpen,
    onOpen: onExportModalOpen,
    onOpenChange: onExportModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onOpenChange: onCreateModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isSeeModalOpen,
    onOpen: onSeeModalOpen,
    onOpenChange: onSeeModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isCancelModalOpen,
    onOpen: onCancelModalOpen,
    onOpenChange: onCancelModalOpenChange,
  } = useDisclosure();

  const handleCreateSuccess = useCallback(() => {
    refetch();
    onCreateModalOpenChange();
  }, [refetch, onCreateModalOpenChange]);

  const handleCancelSuccess = useCallback(() => {
    refetch();
    onCancelModalOpenChange();
  }, [refetch, onCancelModalOpenChange]);

  // 🔥 Función para abrir modal de ver detalles
  const handleOpenSeeModal = useCallback(
    (routeId: number) => {
      setSelectedRouteId(routeId);
      onSeeModalOpen();
    },
    [onSeeModalOpen],
  );

  // 🔥 Función para cerrar modal de ver detalles
  const handleCloseSeeModal = useCallback(() => {
    onSeeModalOpenChange();
    // Pequeño delay para limpiar el ID después de cerrar
    setTimeout(() => setSelectedRouteId(null), 300);
  }, [onSeeModalOpenChange]);

  // 🔥 Función para abrir modal de cancelar
  const handleOpenCancelModal = useCallback(
    (routeId: number) => {
      setSelectedRouteId(routeId);
      onCancelModalOpen();
    },
    [onCancelModalOpen],
  );

  const pages = paginationConfig.totalPages;
  const page = paginationConfig.currentPage;

  const headerColumns = useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const routesLength = routes ? routes.length : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "--------";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "--------";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  const renderEstadoCell = (estado: string) => {
    const estadoColors: Record<
      string,
      "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    > = {
      pendiente: "warning",
      en_proceso: "primary",
      completada: "success",
      cancelada: "danger",
    };

    const estadoLabels: Record<string, string> = {
      pendiente: "Pendiente",
      en_proceso: "En Proceso",
      completada: "Completada",
      cancelada: "Cancelada",
    };

    return (
      <div className="flex justify-center items-center">
        <Chip
          className="capitalize"
          color={estadoColors[estado] || "default"}
          size="sm"
          variant="flat"
        >
          {estadoLabels[estado] || capitalizeName(estado)}
        </Chip>
      </div>
    );
  };

  const displayValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return "--------";
    }

    return String(value);
  };

  const renderCell = (route: RouteListItem, columnKey: React.Key) => {
    switch (columnKey) {
      case "nombre":
        return (
          <div className="flex flex-col justify-center items-center min-w-0 flex-1">
            <span className="text-sm font-medium text-center truncate block max-w-[200px]">
              {capitalizeName(route.nombre)}
            </span>
          </div>
        );

      case "vendedor_nombre":
        return (
          <div className="flex flex-col justify-center items-center min-w-0 flex-1">
            <span className="text-sm font-medium text-center truncate block max-w-[200px]">
              {capitalizeName((route as any).vendedor_nombre) ||
                displayValue(route.vendedor_id)}
            </span>
          </div>
        );

      case "almacen_nombre":
        return (
          <div className="flex flex-col justify-center items-center min-w-0 flex-1">
            <span className="text-sm font-medium text-center truncate block max-w-[200px]">
              {capitalizeName((route as any).almacen_nombre) ||
                displayValue(route.almacen_id)}
            </span>
          </div>
        );

      case "fecha":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm">{formatDate(route.fecha)}</span>
          </div>
        );

      case "estado":
        return renderEstadoCell(route.estado);

      case "total_clientes":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm font-semibold">
              {route.total_clientes}{" "}
              {route.total_clientes === 1 ? "cliente" : "clientes"}
            </span>
          </div>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center gap-1">
            <Tooltip closeDelay={0} content="Ver detalles">
              <Button
                className="text-lg min-w-auto h-auto p-1 bg-transparent text-default-400 cursor-pointer active:opacity-50"
                onPress={() => handleOpenSeeModal(route.id)}
              >
                <EyeIcon />
              </Button>
            </Tooltip>
            {route.estado === "pendiente" && (
              <Tooltip color="danger" content="Cancelar ruta">
                <Button
                  className="text-lg min-w-auto h-auto p-1 bg-transparent text-danger cursor-pointer active:opacity-50"
                  onPress={() => handleOpenCancelModal(route.id)}
                >
                  <MinusCircle className="w-4.5 h-4.5" />
                </Button>
              </Tooltip>
            )}
          </div>
        );

      default:
        return displayValue(route[columnKey as keyof RouteListItem]);
    }
  };

  const TopContent = useMemo(() => {
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
        {/* Título */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:w-auto"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <h2 className="text-xl font-bold text-[#040444]">Rutas de Entrega</h2>
        </motion.div>

        {/* Botones de acción */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Exportar */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-auto"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            {routesLength > 0 && (
              <Button
                className="w-full md:w-auto text-xs"
                startContent={<ShareIos />}
                variant="flat"
                onPress={() => onExportModalOpen()}
              >
                Exportar
              </Button>
            )}
          </motion.div>

          {/* Columnas */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-auto"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="w-full md:w-[130px] text-xs"
                  endContent={<NavArrowDown />}
                  variant="flat"
                >
                  Columnas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                className="w-full sm:w-auto"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  if (keys !== "all") setVisibleColumns(keys as Set<string>);
                }}
              >
                {columns.map((col) => (
                  <DropdownItem key={col.uid}>{col.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </motion.div>

          {/* Crear ruta */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-auto"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Button
              className="w-full md:w-auto text-sm bg-[#2e93d1] text-white font-semibold hover:bg-[#2e93d1]/90 transition-colors"
              startContent={<Map />}
              variant="flat"
              onPress={onCreateModalOpen}
            >
              Crear ruta
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }, [visibleColumns, routesLength]);

  const BottomContent = useMemo(() => {
    if (pages === 0) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-center items-center px-2 gap-2 border-t border-gray-300 pt-4">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-[#2e93d1] text-white font-semibold",
          }}
          color="default"
          page={page}
          total={pages}
          variant="light"
          onChange={updateCurrentPage}
        />
      </div>
    );
  }, [page, pages, updateCurrentPage]);

  const LoadingContent = () => <div className="loader" />;

  return (
    <div className="w-full overflow-auto px-5">
      <Table
        isHeaderSticky
        aria-label="Tabla de Rutas"
        bottomContent={BottomContent}
        classNames={{
          wrapper: "min-w-full max-h-[500px]",
          table: "min-w-[1100px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="single"
        topContent={TopContent}
        topContentPlacement="outside"
        onSelectionChange={(keys) => {
          if (keys !== "all") {
            setSelectedKeys(keys as Set<string>);
          }
        }}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              className="text-center font-semibold"
              style={
                column.uid === "nombre"
                  ? { width: "16%", minWidth: "150px" }
                  : column.uid === "vendedor_nombre"
                    ? { width: "16%", minWidth: "150px" }
                    : column.uid === "almacen_nombre"
                      ? { width: "16%", minWidth: "150px" }
                      : column.uid === "fecha"
                        ? { width: "12%", minWidth: "110px" }
                        : column.uid === "estado"
                          ? { width: "12%", minWidth: "110px" }
                          : column.uid === "total_clientes"
                            ? { width: "12%", minWidth: "110px" }
                            : { width: "16%", minWidth: "120px" }
              }
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={
            error ? (
              <div className="text-center py-10 text-red-600 font-semibold">
                {error instanceof Error
                  ? error.message
                  : "Error al cargar las rutas."}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 font-medium">
                <Map className="w-12 h-12 mb-4 text-gray-400" />
                <p>No hay rutas disponibles.</p>
              </div>
            )
          }
          items={loading ? [] : routes}
          loadingContent={<LoadingContent />}
          loadingState={loading ? "loading" : "idle"}
        >
          {(item: RouteListItem) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modales */}
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onOpenChange={onCreateModalOpenChange}
        onSuccess={handleCreateSuccess}
      />

      <SeeRouteModal
        isOpen={isSeeModalOpen}
        routeId={selectedRouteId}
        onOpenChange={handleCloseSeeModal}
      />

      <CancelRouteModal
        isOpen={isCancelModalOpen}
        routeId={selectedRouteId}
        onOpenChange={onCancelModalOpenChange}
        onSuccess={handleCancelSuccess}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={onExportModalOpenChange}
      />
    </div>
  );
}
