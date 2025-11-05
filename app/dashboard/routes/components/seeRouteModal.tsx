"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Chip,
  Progress,
  Tabs,
  Tab,
  Card,
  CardBody,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import routeService from "../services/route.service";

interface SeeRouteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: number | null;
}

interface RouteData {
  id: number;
  nombre: string;
  vendedor_id: number;
  estado: string;
  fecha: string;
  inicio_timestamp: string | null;
  fin_timestamp: string | null;
  detalles: any[];
  total_clientes: number;
  motivo_cancelacion?: string;
  cancelada_en?: string;
}

interface ProgressData {
  ruta_id: number;
  estado_ruta: string;
  total_clientes: number;
  visitados: number;
  pendientes: number;
  entregados: number;
  no_entregados: number;
  porcentaje_avance: number;
  total_esperado: number;
  total_entregado: number;
  perdida_estimada: number;
  detalles: ClienteProgress[];
}

interface ClienteProgress {
  detalle_id: number;
  cliente_id: number;
  cliente_nombre: string;
  orden_visita: number;
  estado_entrega: string;
  motivo: string | null;
  timestamp: string | null;
  subtotal_esperado: number;
  subtotal_entregado: number;
}

interface InventoryData {
  productos: ProductoInventario[];
  total_inicial: number;
  total_actual: number;
  total_entregado: number;
  porcentaje_entregado: number;
}

interface ProductoInventario {
  producto_id: number;
  nombre: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  cantidad_entregada: number;
  porcentaje_entregado: number;
}

export function SeeRouteModal({
  isOpen,
  onOpenChange,
  routeId,
}: SeeRouteModalProps) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const formatDate = (dateString: string) => {
    if (!dateString) return "--------";
    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "--------";
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const formatDateTime = (timestamp: string | null) => {
    if (!timestamp) return "--------";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(amount);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "warning";
      case "en_proceso":
        return "primary";
      case "completada":
        return "success";
      case "cancelada":
        return "danger";
      default:
        return "default";
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "en_proceso":
        return "En Proceso";
      case "completada":
        return "Completada";
      case "cancelada":
        return "Cancelada";
      default:
        return estado;
    }
  };

  const getEstadoEntregaColor = (estado: string) => {
    return estado === "entregado" ? "success" : "danger";
  };

  useEffect(() => {
    if (isOpen && routeId) {
      setLoading(true);

      // Cargar datos en paralelo
      Promise.all([
        routeService.getById(routeId),
        routeService.getProgress(routeId),
        routeService.getInventory(routeId),
      ])
        .then(([routeData, progressData, inventoryData]) => {
          setRoute(routeData);
          setProgress(progressData);
          setInventory(inventoryData);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error al obtener datos de la ruta");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, routeId]);

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[900px] max-h-[90vh] bg-white rounded-3xl",
      }}
      hideCloseButton={true}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-2 p-6 pb-4 shadow-sm">
              {loading ? (
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {route?.nombre || "Cargando..."}
                    </h2>
                    {route && (
                      <Chip
                        color={getEstadoColor(route.estado)}
                        size="lg"
                        variant="flat"
                      >
                        {getEstadoText(route.estado)}
                      </Chip>
                    )}
                  </div>
                  {route && (
                    <p className="text-sm text-gray-500">
                      Fecha de salida: {formatDate(route.fecha)}
                    </p>
                  )}
                </>
              )}
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="loader" />
                </div>
              ) : route && route.estado === "cancelada" ? (
                // Vista especial para rutas canceladas
                <div className="flex flex-col items-center justify-center  px-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-10 h-10 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Esta ruta ha sido cancelada
                  </h3>

                  <Card className="w-full max-w-2xl mt-6 shadow-sm border-red-200 border-2">
                    <CardBody className="p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">
                            Motivo de cancelación:
                          </p>
                          <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-base text-gray-900">
                              {route.motivo_cancelacion || "No especificado"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                          {route.cancelada_en && (
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500 mb-1">
                                Fecha de cancelación:
                              </p>
                              <p className="text-base text-gray-900">
                                {formatDateTime(route.cancelada_en)}
                              </p>
                            </div>
                          )}

                          <div className="flex-1 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4">
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Fecha programada original:
                            </p>
                            <p className="text-base text-gray-900">
                              {formatDate(route.fecha)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <p className="text-xs text-gray-500 mt-6 text-center max-w-md">
                    Las órdenes asociadas a esta ruta han sido liberadas y el
                    inventario ha sido devuelto al almacén.
                  </p>
                </div>
              ) : route && progress ? (
                <Tabs
                  classNames={{
                    tabList: "gap-2 w-full",
                    cursor: "w-full",
                    tab: "max-w-fit px-4 h-10",
                  }}
                  color="primary"
                  selectedKey={activeTab}
                  variant="underlined"
                  onSelectionChange={(key) => setActiveTab(key as string)}
                >
                  {/* TAB GENERAL */}
                  <Tab key="general" title="General">
                    <div className="space-y-4 mt-4">
                      {/* Cards de métricas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="bg-blue-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              Total Clientes
                            </p>
                            <p className="text-2xl font-bold text-blue-900">
                              {progress.total_clientes}
                            </p>
                          </CardBody>
                        </Card>

                        <Card className="bg-green-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-green-600 font-medium mb-1">
                              Entregados
                            </p>
                            <p className="text-2xl font-bold text-green-900">
                              {progress.entregados}
                            </p>
                          </CardBody>
                        </Card>

                        <Card className="bg-red-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-red-600 font-medium mb-1">
                              No Entregados
                            </p>
                            <p className="text-2xl font-bold text-red-900">
                              {progress.no_entregados}
                            </p>
                          </CardBody>
                        </Card>

                        <Card className="bg-amber-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-amber-600 font-medium mb-1">
                              Pendientes
                            </p>
                            <p className="text-2xl font-bold text-amber-900">
                              {progress.pendientes}
                            </p>
                          </CardBody>
                        </Card>
                      </div>

                      {/* Progreso */}
                      <Card className="shadow-sm">
                        <CardBody className="p-5">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Progreso de Entregas
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {progress.porcentaje_avance.toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            className="mb-3"
                            color="primary"
                            size="lg"
                            value={progress.porcentaje_avance}
                          />
                          <p className="text-xs text-gray-500">
                            {progress.visitados} de {progress.total_clientes}{" "}
                            clientes visitados
                          </p>
                        </CardBody>
                      </Card>

                      {/* Información financiera */}
                      <Card className="shadow-sm">
                        <CardBody className="p-5 space-y-4">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            💰 Resumen Financiero
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-1">
                                Total Esperado
                              </p>
                              <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(progress.total_esperado)}
                              </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-xs text-green-600 mb-1">
                                Total Entregado
                              </p>
                              <p className="text-xl font-bold text-green-900">
                                {formatCurrency(progress.total_entregado)}
                              </p>
                            </div>

                            <div className="bg-red-50 rounded-lg p-4">
                              <p className="text-xs text-red-600 mb-1">
                                Pérdida
                              </p>
                              <p className="text-xl font-bold text-red-900">
                                {formatCurrency(progress.perdida_estimada)}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Horarios */}
                      <Card className="shadow-sm">
                        <CardBody className="p-5">
                          <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                            🕐 Horarios
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Inicio</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {route.inicio_timestamp
                                    ? formatDateTime(route.inicio_timestamp)
                                    : "No iniciada"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Fin</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {route.fin_timestamp
                                    ? formatDateTime(route.fin_timestamp)
                                    : "En proceso"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </Tab>

                  {/* TAB CLIENTES */}
                  <Tab key="clientes" title="Clientes">
                    <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto">
                      {progress.detalles.map((cliente) => (
                        <Card key={cliente.detalle_id} className="shadow-sm">
                          <CardBody className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold text-gray-700">
                                    {cliente.orden_visita}
                                  </span>
                                  <h4 className="font-semibold text-gray-900">
                                    {cliente.cliente_nombre}
                                  </h4>
                                </div>
                                {cliente.timestamp && (
                                  <p className="text-xs text-gray-500">
                                    Visitado:{" "}
                                    {formatDateTime(cliente.timestamp)}
                                  </p>
                                )}
                              </div>
                              <Chip
                                color={getEstadoEntregaColor(
                                  cliente.estado_entrega
                                )}
                                size="sm"
                                variant="flat"
                              >
                                {cliente.estado_entrega === "entregado"
                                  ? "Entregado"
                                  : cliente.motivo
                                    ? "No Entregado"
                                    : "Pendiente"}
                              </Chip>
                            </div>

                            {cliente.motivo && (
                              <div className="bg-red-50 rounded-lg p-3 mb-3">
                                <p className="text-xs text-red-600 font-medium mb-1">
                                  Motivo de no entrega:
                                </p>
                                <p className="text-sm text-red-900">
                                  {cliente.motivo}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">
                                  Esperado
                                </p>
                                <p className="text-sm font-bold text-gray-900">
                                  {formatCurrency(cliente.subtotal_esperado)}
                                </p>
                              </div>
                              <div
                                className={`rounded-lg p-3 ${
                                  cliente.subtotal_entregado > 0
                                    ? "bg-green-50"
                                    : "bg-gray-50"
                                }`}
                              >
                                <p
                                  className={`text-xs mb-1 ${
                                    cliente.subtotal_entregado > 0
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Entregado
                                </p>
                                <p
                                  className={`text-sm font-bold ${
                                    cliente.subtotal_entregado > 0
                                      ? "text-green-900"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {formatCurrency(cliente.subtotal_entregado)}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </Tab>

                  {/* TAB INVENTARIO */}
                  <Tab key="inventario" title="Inventario">
                    <div className="space-y-4 mt-4">
                      {/* Resumen de inventario */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="bg-purple-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-purple-600 font-medium mb-1">
                              Total Cargado
                            </p>
                            <p className="text-2xl font-bold text-purple-900">
                              {inventory?.total_inicial || 0}
                            </p>
                          </CardBody>
                        </Card>

                        <Card className="bg-green-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-green-600 font-medium mb-1">
                              Entregado
                            </p>
                            <p className="text-2xl font-bold text-green-900">
                              {inventory?.total_entregado || 0}
                            </p>
                          </CardBody>
                        </Card>

                        <Card className="bg-amber-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-amber-600 font-medium mb-1">
                              Restante
                            </p>
                            <p className="text-2xl font-bold text-amber-900">
                              {inventory?.total_actual || 0}
                            </p>
                          </CardBody>
                        </Card>

                        <Card className="bg-blue-50 border-none shadow-sm">
                          <CardBody className="p-4">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              % Vendido
                            </p>
                            <p className="text-2xl font-bold text-blue-900">
                              {inventory?.porcentaje_entregado.toFixed(1) || 0}%
                            </p>
                          </CardBody>
                        </Card>
                      </div>

                      {/* Lista de productos */}
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {inventory?.productos.map((producto) => (
                          <Card
                            key={producto.producto_id}
                            className="shadow-sm"
                          >
                            <CardBody className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-gray-900">
                                  {producto.nombre}
                                </h4>
                                <Chip
                                  color={
                                    producto.porcentaje_entregado >= 80
                                      ? "success"
                                      : producto.porcentaje_entregado >= 50
                                        ? "warning"
                                        : "danger"
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {producto.porcentaje_entregado.toFixed(1)}%
                                </Chip>
                              </div>

                              <Progress
                                className="mb-3"
                                color={
                                  producto.porcentaje_entregado >= 80
                                    ? "success"
                                    : producto.porcentaje_entregado >= 50
                                      ? "warning"
                                      : "danger"
                                }
                                size="sm"
                                value={producto.porcentaje_entregado}
                              />

                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-gray-500">Cargado</p>
                                  <p className="font-semibold text-gray-900">
                                    {producto.cantidad_inicial}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Entregado</p>
                                  <p className="font-semibold text-green-600">
                                    {producto.cantidad_entregada}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Restante</p>
                                  <p className="font-semibold text-amber-600">
                                    {producto.cantidad_actual}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  No se encontró información de la ruta.
                </div>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="font-medium"
                color="default"
                variant="flat"
                onPress={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
              {route && route.estado !== "cancelada" && (
                <Button
                  className="font-medium text-white bg-red-600 hover:bg-red-700 active:opacity-70"
                  variant="flat"
                  onPress={async () => {
                    try {
                      setLoading(true);
                      await routeService.exportSummaryToPdf(route.id);
                      toast.success("PDF descargado exitosamente");
                    } catch (error) {
                      console.error(error);
                      toast.error("Error al descargar el PDF");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Descargar PDF
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
