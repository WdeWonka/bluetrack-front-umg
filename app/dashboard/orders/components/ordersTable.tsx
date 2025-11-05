"use client";
import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import {
  Search,
  NavArrowDown,
  ShareIos,
  Truck,
  PageMinusIn,
} from "iconoir-react";

import useOrders from "../hooks/useOrders";

import { ExportModal } from "./exportModal";
import { CreateOrderModal } from "./createOrderModal";
import { EditOrderModal } from "./editOrderModal";
import { SeeOrderModal } from "./seeOrderModal";
import { CancelOrderModal } from "./cancelOrderModal";

import { EyeIcon, EditIcon } from "@/components/icons";

// Columnas de la tabla
export const columns = [
  { name: "CLIENTE", uid: "cliente_nombre" },
  { name: "PRODUCTO", uid: "producto_nombre" },
  { name: "CANTIDAD", uid: "cantidad" },
  { name: "PRIORIDAD", uid: "prioridad" },
  { name: "ESTADO", uid: "asignada" },
  { name: "VIGENCIA", uid: "cancelada" },
  { name: "FECHA SOLICITUD", uid: "fecha_solicitud" },
  { name: "ACCIONES", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "cliente_nombre",
  "producto_nombre",
  "cantidad",
  "asignada",
  "cancelada",
  "fecha_solicitud",
  "actions",
];

export default function OrdersTable() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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

  const {
    orders,
    loading,
    paginationConfig,
    updateCurrentPage,
    searchQuery,
    error,
    refetch,
  } = useOrders({ includeCancelled: true });

  const pages = paginationConfig.totalPages;
  const page = paginationConfig.currentPage;

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
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onOpenChange: onEditModalOpenChange,
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

  const handleEditSuccess = useCallback(() => {
    refetch();
    onEditModalOpenChange();
  }, [refetch, onEditModalOpenChange]);

  const handleCancelSuccess = useCallback(() => {
    refetch();
    onCancelModalOpenChange();
  }, [refetch, onCancelModalOpenChange]);

  const headerColumns = useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const ordersLength = orders ? orders.length : 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return "--------";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "--------";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  const renderStatusCell = (asignada: boolean) => {
    return (
      <div className="flex justify-center items-center">
        <Chip
          className="capitalize"
          color={asignada ? "success" : "warning"}
          size="sm"
          variant="flat"
        >
          {asignada ? "Asignada" : "Pendiente"}
        </Chip>
      </div>
    );
  };

  const renderVigenciaCell = (cancelada: boolean) => {
    return (
      <div className="flex justify-center items-center">
        <Chip
          className="capitalize"
          color={cancelada ? "danger" : "success"}
          size="sm"
          variant="flat"
        >
          {cancelada ? "Cancelada" : "Activa"}
        </Chip>
      </div>
    );
  };

  const renderPriorityCell = (prioridad: string) => {
    const priorityColors: Record<
      string,
      "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    > = {
      normal: "default",
      alta: "warning",
      urgente: "danger",
    };

    return (
      <div className="flex justify-center items-center">
        <Chip
          className="capitalize"
          color={priorityColors[prioridad?.toLowerCase()] || "default"}
          size="sm"
          variant="flat"
        >
          {capitalizeName(prioridad || "Normal")}
        </Chip>
      </div>
    );
  };

  const displayValue = (value: string | null | undefined) =>
    value?.trim() ? value : "--------";

  const renderCell = (order: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "cliente_nombre":
        return (
          <div className="flex flex-col justify-center items-center min-w-0 flex-1">
            <span className="text-sm font-medium text-center truncate block max-w-[200px]">
              {capitalizeName(order.cliente_nombre)}
            </span>
          </div>
        );

      case "producto_nombre":
        return (
          <div className="flex flex-col justify-center items-center min-w-0 flex-1">
            <span className="text-sm font-medium text-center truncate block max-w-[200px]">
              {capitalizeName(order.producto_nombre)}
            </span>
          </div>
        );

      case "cantidad":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm font-semibold">
              {order.cantidad} unidades
            </span>
          </div>
        );

      case "prioridad":
        return renderPriorityCell(order.prioridad);

      case "asignada":
        return renderStatusCell(order.asignada);

      case "cancelada":
        return renderVigenciaCell(order.cancelada || false);

      case "fecha_solicitud":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm">{order.fecha_solicitud}</span>
          </div>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center gap-1">
            {/* Siempre mostrar Ver */}
            <Tooltip closeDelay={0} content="Ver">
              <Button
                className="text-lg min-w-auto h-auto p-1 bg-transparent text-default-400 cursor-pointer active:opacity-50"
                onPress={() => {
                  setSelectedOrderId(order.id);
                  onSeeModalOpen();
                }}
              >
                <EyeIcon />
              </Button>
            </Tooltip>

            {/* Solo mostrar Editar y Cancelar si NO está asignada NI cancelada */}
            {!order.asignada && !order.cancelada && (
              <>
                <Tooltip closeDelay={0} content="Editar">
                  <Button
                    className="text-lg min-w-auto h-auto p-1 bg-transparent text-default-400 cursor-pointer active:opacity-50"
                    onPress={() => {
                      setSelectedOrderId(order.id);
                      onEditModalOpen();
                    }}
                  >
                    <EditIcon />
                  </Button>
                </Tooltip>
                <Tooltip closeDelay={0} color="danger" content="Cancelar orden">
                  <Button
                    className="text-lg min-w-auto h-auto p-1 bg-transparent text-danger cursor-pointer active:opacity-50"
                    onPress={() => {
                      setSelectedOrderId(order.id);
                      onCancelModalOpen();
                    }}
                  >
                    <PageMinusIn className="w-4.5 h-4.5" />
                  </Button>
                </Tooltip>
              </>
            )}
          </div>
        );

      default:
        return displayValue(order[columnKey as string]);
    }
  };

  const TopContent = useMemo(() => {
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
        {/* 🔍 Searchbar */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:max-w-[400px] flex-shrink-0"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Input
            isClearable
            className="w-full"
            classNames={{
              inputWrapper: [
                "bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm",
                "hover:bg-white/80 hover:border-white/60",
                "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                "group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                "transition-all duration-200",
                "rounded-xl h-[50px]",
              ],
              input: "text-[#040444] placeholder:text-[#040444]/30 text-[14px]",
            }}
            placeholder="Buscar por cliente..."
            startContent={<Search className="text-gray-400" />}
            value={filterValue}
            variant="bordered"
            onClear={() => {
              setFilterValue("");
              searchQuery("");
            }}
            onValueChange={(val) => {
              setFilterValue(val);
              searchQuery(val);
            }}
          />
        </motion.div>

        {/* 📦 Botones de acción */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Exportar */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-auto"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            {ordersLength > 0 && (
              <Button
                className="w-full md:w-auto text-xs"
                startContent={<ShareIos />}
                variant="flat"
                onPress={onExportModalOpen}
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

          {/* Agregar orden */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-auto"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Button
              className="w-full md:w-auto text-sm bg-[#2e93d1] text-white font-semibold hover:bg-[#2e93d1]/90 transition-colors"
              startContent={<Truck />}
              variant="flat"
              onPress={onCreateModalOpen}
            >
              Agregar orden
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, ordersLength]);

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
        aria-label="Tabla de Órdenes"
        bottomContent={BottomContent}
        classNames={{
          wrapper: "min-w-full max-h-[500px]",
          table: "min-w-[1000px]",
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
                column.uid === "cliente_nombre"
                  ? { width: "16%", minWidth: "140px" }
                  : column.uid === "producto_nombre"
                    ? { width: "16%", minWidth: "140px" }
                    : column.uid === "cantidad"
                      ? { width: "11%", minWidth: "100px" }
                      : column.uid === "prioridad"
                        ? { width: "10%", minWidth: "90px" }
                        : column.uid === "asignada"
                          ? { width: "10%", minWidth: "90px" }
                          : column.uid === "cancelada"
                            ? { width: "10%", minWidth: "90px" }
                            : column.uid === "fecha_solicitud"
                              ? { width: "12%", minWidth: "110px" }
                              : { width: "15%", minWidth: "120px" }
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
                  : "Error al cargar las órdenes."}
              </div>
            ) : filterValue ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 font-medium">
                <Truck className="w-12 h-12 mb-4 text-gray-400" />
                No se encontró ninguna orden con &quot;{filterValue}&quot;.
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 font-medium">
                No hay órdenes disponibles.
              </div>
            )
          }
          items={loading ? [] : orders}
          loadingContent={<LoadingContent />}
          loadingState={loading ? "loading" : "idle"}
        >
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={onExportModalOpenChange}
      />

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onOpenChange={onCreateModalOpenChange}
        onSuccess={handleCreateSuccess}
      />

      <EditOrderModal
        isOpen={isEditModalOpen}
        orderId={selectedOrderId}
        onOpenChange={onEditModalOpenChange}
        onSuccess={handleEditSuccess}
      />

      <SeeOrderModal
        isOpen={isSeeModalOpen}
        orderId={selectedOrderId}
        onOpenChange={onSeeModalOpenChange}
      />

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderId={selectedOrderId}
        onOpenChange={onCancelModalOpenChange}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
