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
import {
  Search,
  NavArrowDown,
  ShareIos,
  Import,
  UserPlus,
  User,
} from "iconoir-react";

import useCustomers from "../hooks/useCustomer";

import { ImportModal } from "./importModal";
import { ExportModal } from "./exportModal";
import { CreateCustomerModal } from "./createCustomerModal";
import { EditCustomerModal } from "./editCustomerModal";
import { SeeCustomerModal } from "./seeCustomerModal";

import { EyeIcon, EditIcon } from "@/components/icons";

export const columns = [
  { name: "NOMBRE", uid: "nombre" },
  { name: "DIRECCIÓN", uid: "direccion" },
  { name: "TELÉFONO", uid: "telefono" },
  { name: "FECHA DE CREACIÓN", uid: "creado_en" },
  { name: "ACCIONES", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "nombre",
  "direccion",
  "telefono",
  "creado_en",
  "actions",
];

export default function CustomersTable() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );

  const {
    customers,
    loading,
    paginationConfig,
    updateCurrentPage,
    searchQuery,
    error,
    refetch,
  } = useCustomers();

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

  const handleImportSuccess = useCallback(() => {
    refetch();
    onImportModalOpenChange();
  }, [refetch, onImportModalOpenChange]);

  const handleExportSuccess = useCallback(() => {
    refetch();
    onExportModalOpenChange();
  }, [refetch, onExportModalOpenChange]);

  const handleCreateSuccess = useCallback(() => {
    refetch();
    onCreateModalOpenChange();
  }, [refetch, onCreateModalOpenChange]);

  const handleEditSuccess = useCallback(() => {
    refetch();
    onEditModalOpenChange();
  }, [refetch, onEditModalOpenChange]);

  const headerColumns = useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

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

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "--------";
    const cleaned = ("" + phone).replace(/\D/g, "");

    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }

    return phone;
  };

  const customerLength = customers ? customers.length : 0;

  const displayValue = (value: string | null | undefined) =>
    value?.trim() ? value : "--------";

  const renderCell = (user: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "nombre":
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 flex-shrink-0 cursor-pointer flex items-center justify-center transition-transform bg-[#2e93d1] text-white dark:bg-[#2e93d1] dark:text-white font-semibold text-sm hover:scale-105 focus:outline-none shadow-sm shadow-gray-400 dark:shadow-gray-700 rounded-full">
              <User className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate block max-w-[250px]">
                {capitalizeName(user.nombre)}
              </span>
            </div>
          </div>
        );
      case "telefono":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm">{formatPhone(user.telefono)}</span>
          </div>
        );
      case "direccion":
        return (
          <div className="flex justify-center items-center">
            <span className="text-sm text-center">
              {displayValue(user.direccion)}
            </span>
          </div>
        );

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
                  setSelectedCustomerId(user.id);
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
                  setSelectedCustomerId(user.id);
                  onEditModalOpen();
                }}
              >
                <EditIcon />
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
              placeholder="Buscar por nombre, dirección o telefono.."
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
              {customerLength > 0 && (
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
            {/* Agregar usuario */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="w-full md:w-auto"
              initial={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <Button
                className="w-full md:w-auto text-sm bg-[#2e93d1] text-white font-semibold hover:bg-[#2e93d1]/90 transition-colors"
                startContent={<UserPlus />}
                variant="flat"
                onPress={onCreateModalOpen}
              >
                Agregar Cliente
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns]);

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
        aria-label="Customers Table"
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
                  ? { width: "20%", minWidth: "200px" }
                  : column.uid === "telefono"
                    ? { width: "15%", minWidth: "150px" }
                    : column.uid === "direccion"
                      ? { width: "40%", minWidth: "300px" }
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
                  : "Error al cargar los clientes."}
              </div>
            ) : filterValue ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 font-medium">
                <svg
                  aria-hidden="true"
                  className="w-20 h-20 mb-4"
                  fill="none"
                  viewBox="0 0 64 64"
                >
                  <ellipse
                    cx="32"
                    cy="54"
                    fill="#e5e7eb"
                    opacity="0.5"
                    rx="18"
                    ry="4"
                  />
                  <path
                    d="M32 8c-9.94 0-18 8.06-18 18 0 6.08 3.04 11.44 7.7 14.7C21.1 41.7 20 44.2 20 47c0 4.42 5.37 8 12 8s12-3.58 12-8c0-2.8-1.1-5.3-1.7-6.3C46.96 37.44 50 32.08 50 26c0-9.94-8.06-18-18-18z"
                    fill="#f3f4f6"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  />
                  <circle cx="24" cy="28" fill="#cbd5e1" r="2" />
                  <circle cx="40" cy="28" fill="#cbd5e1" r="2" />
                  <path
                    d="M28 36c1.33 1.33 6.67 1.33 8 0"
                    stroke="#cbd5e1"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
                No se encontró ningún cliente con &quot;{filterValue}&quot;.
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 font-medium">
                No hay clientes disponibles.
              </div>
            )
          }
          items={loading ? [] : customers}
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
        onSuccess={handleExportSuccess}
      />

      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onOpenChange={onCreateModalOpenChange}
        onSuccess={handleCreateSuccess}
      />

      <EditCustomerModal
        customerId={selectedCustomerId}
        isOpen={isEditModalOpen}
        onOpenChange={onEditModalOpenChange}
        onSuccess={handleEditSuccess}
      />

      <SeeCustomerModal
        customerId={selectedCustomerId}
        isOpen={isSeeModalOpen}
        onOpenChange={onSeeModalOpenChange}
      />
    </div>
  );
}
