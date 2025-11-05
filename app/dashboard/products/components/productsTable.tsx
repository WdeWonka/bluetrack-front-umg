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
  Pagination,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { Search, NavArrowDown, ShareIos, Import, BoxIso } from "iconoir-react";

import useProducts from "../hooks/useProducts";

import { ImportModal } from "./importModal";
import { ExportModal } from "./exportModal";
import { SeeProductModal } from "./seeProductModal";
import { CreateProductModal } from "./createProductModal";
import { EditProductModal } from "./editProductModal";
import { DeleteProductModal } from "./deleteProductModal";

import { EyeIcon, EditIcon, TrashIcon } from "@/components/icons";

export const columns = [
  { name: "NOMBRE", uid: "nombre" },
  { name: "PRECIO", uid: "precio" },
  { name: "STOCK", uid: "stock_total" },
  { name: "FECHA DE CREACIÓN", uid: "creado_en" },
  { name: "ACCIONES", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "nombre",
  "precio",
  "stock_total",
  "creado_en",
  "actions",
];

export default function ProductsTable() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

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
    products,
    loading,
    paginationConfig,
    updateCurrentPage,
    searchQuery,
    error,
    refetch,
  } = useProducts();

  const pages = paginationConfig.totalPages;
  const page = paginationConfig.currentPage;

  const {
    isOpen: isImportModalOpen,
    onOpen: onImportModalOpen,
    onOpenChange: onImportModalOpenChange,
  } = useDisclosure();

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
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();

  const handleImportSuccess = useCallback(() => {
    refetch();
    onImportModalOpenChange();
  }, [refetch, onImportModalOpenChange]);

  const handleCreateSuccess = useCallback(() => {
    refetch();
    onCreateModalOpenChange();
  }, [refetch, onCreateModalOpenChange]);

  const handleEditSuccess = useCallback(() => {
    refetch();
    onEditModalOpenChange();
  }, [refetch, onEditModalOpenChange]);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
    onDeleteModalOpenChange();
  }, [refetch, onDeleteModalOpenChange]);

  const headerColumns = useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const productsLength = products ? products.length : 0;

  const formatDate = (dateString: string, isCreatedAt?: boolean) => {
    if (!dateString) return "--------";
    if (isCreatedAt) {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return "--------";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;
  };

  const renderStockCell = (stock: number) => {
    const value = stock || 0;

    let bgColor = "";
    let textColor = "";
    let dotColor = "";

    if (value >= 1000) {
      bgColor = "bg-success-50";
      textColor = "text-success-700";
      dotColor = "bg-success-500";
    } else if (value >= 500) {
      bgColor = "bg-warning-50";
      textColor = "text-warning-700";
      dotColor = "bg-warning-500";
    } else {
      bgColor = "bg-danger-50";
      textColor = "text-danger-700";
      dotColor = "bg-danger-500";
    }

    return (
      <div className="flex justify-center items-center">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} min-w-[100px] justify-center`}
        >
          <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
          <span className={`font-medium text-sm ${textColor}`}>
            {value.toLocaleString()} unidades
          </span>
        </div>
      </div>
    );
  };

  const displayValue = (value: string | null | undefined) =>
    value?.trim() ? value : "--------";

  const renderCell = (user: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "nombre":
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 flex-shrink-0 cursor-pointer flex items-center justify-center transition-transform bg-[#2e93d1] text-white dark:bg-[#2e93d1] dark:text-white font-semibold text-sm hover:scale-105 focus:outline-none shadow-sm shadow-gray-400 dark:shadow-gray-700 rounded-full">
              <BoxIso className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate block max-w-[250px]">
                {capitalizeName(user.nombre)}
              </span>
            </div>
          </div>
        );

      case "precio":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm ">
              Q {user.precio ? parseFloat(user.precio).toFixed(2) : "0.00"}
            </span>
          </div>
        );
      case "stock_total":
        return renderStockCell(user.stock_total);

      case "creado_en":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm">{formatDate(user.creado_en, true)}</span>
          </div>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center">
            <Tooltip closeDelay={0} content="Ver">
              <Button
                className="text-lg min-w-auto h-auto p-1 bg-transparent text-default-400 cursor-pointer active:opacity-50"
                onPress={() => {
                  setSelectedProductId(user.id);
                  onSeeModalOpen();
                }}
              >
                <EyeIcon />
              </Button>
            </Tooltip>
            <Tooltip closeDelay={0} content="Editar">
              <Button
                className="text-lg min-w-auto h-auto p-1 bg-transparent text-default-400 cursor-pointer active:opacity-50"
                onPress={() => {
                  setSelectedProductId(user.id);
                  onEditModalOpen();
                }}
              >
                <EditIcon />
              </Button>
            </Tooltip>
            <Tooltip closeDelay={0} color="danger" content="Eliminar">
              <Button
                className="text-lg min-w-auto h-auto p-1 bg-transparent text-danger cursor-pointer active:opacity-50"
                onPress={() => {
                  setSelectedProductId(user.id);
                  onDeleteModalOpen();
                }}
              >
                <TrashIcon />
              </Button>
            </Tooltip>
          </div>
        );

      default:
        return displayValue(user[columnKey as string]);
    }
  };

  const TopContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 py-2">
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
                input:
                  "text-[#040444] placeholder:text-[#040444]/30 text-[14px]",
              }}
              placeholder="Buscar por nombre o precio..."
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
            {/* Importar + Exportar */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full md:w-auto gap-3"
              initial={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <Button
                className="w-1/2 md:w-auto text-xs"
                startContent={<Import />}
                variant="flat"
                onPress={onImportModalOpen}
              >
                Importar
              </Button>
              {productsLength > 0 && (
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
            {/* Agregar producto */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="w-full md:w-auto"
              initial={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <Button
                className="w-full md:w-auto text-sm bg-[#2e93d1] text-white font-semibold hover:bg-[#2e93d1]/90 transition-colors"
                startContent={<BoxIso />}
                variant="flat"
                onPress={onCreateModalOpen}
              >
                Agregar producto
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, productsLength]);

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
    <div className="w-full overflow-auto px-5 ">
      <Table
        isHeaderSticky
        aria-label="Miembros del Staff"
        bottomContent={BottomContent}
        classNames={{
          wrapper: "min-w-full max-h-[500px]",
          table: "min-w-[800px]",
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
                  ? { width: "25%", minWidth: "150px" }
                  : column.uid === "precio"
                    ? { width: "15%", minWidth: "120px" }
                    : column.uid === "stock_total"
                      ? { width: "25%", minWidth: "150px" }
                      : column.uid === "creado_en"
                        ? { width: "20%", minWidth: "150px" }
                        : { width: "15%", minWidth: "100px" }
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
                  : "Error al cargar los productos."}
              </div>
            ) : filterValue ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 font-medium">
                <BoxIso className="w-12 h-12 mb-4 text-gray-400" />
                No se encontró ningún producto con &quot;{filterValue}&quot;.
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 font-medium">
                No hay productos disponibles.
              </div>
            )
          }
          items={loading ? [] : products}
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

      <ImportModal
        isOpen={isImportModalOpen}
        onOpenChange={onImportModalOpenChange}
        onSuccess={handleImportSuccess}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={onExportModalOpenChange}
      />

      <SeeProductModal
        isOpen={isSeeModalOpen}
        productId={selectedProductId}
        onOpenChange={onSeeModalOpenChange}
      />

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onOpenChange={onCreateModalOpenChange}
        onSuccess={handleCreateSuccess}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        productId={selectedProductId}
        onOpenChange={onEditModalOpenChange}
        onSuccess={handleEditSuccess}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        productId={selectedProductId}
        onOpenChange={onDeleteModalOpenChange}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
