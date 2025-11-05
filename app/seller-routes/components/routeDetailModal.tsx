"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Select,
  SelectItem,
  Input,
  Divider,
  Progress,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Waze from "@/public/img/waze.svg";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Packages,
  User,
  NavArrowRight,
  Phone,
} from "iconoir-react";
import { parseLocalDate } from "@/shared/utils/date";
import routeService, {
  type RouteListItem,
  type NextClientToVisit,
  type RouteDetail,
} from "@/app/dashboard/routes/services/route.service";

interface RouteDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  routeData: RouteListItem | null;
  onRouteUpdated?: () => void;
}

type ModalView = "pending" | "in_progress" | "completed";

export function RouteDetailModal({
  isOpen,
  onOpenChange,
  routeData,
  onRouteUpdated,
}: RouteDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ModalView>("pending");
  const [routeDetails, setRouteDetails] = useState<RouteDetail | null>(null);
  const [currentClient, setCurrentClient] = useState<NextClientToVisit | null>(
    null
  );
  const [estadoEntrega, setEstadoEntrega] = useState<
    "entregado" | "no_entregado"
  >("entregado");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [clientDetails, setClientDetails] = useState<Record<number, any>>({});
  const [isRouteAlreadyCompleted, setIsRouteAlreadyCompleted] = useState(false);

  // Determinar vista según estado
  useEffect(() => {
    if (!routeData) return;

    if (routeData.estado === "pendiente") {
      setView("pending");
      setIsRouteAlreadyCompleted(false);
    } else if (routeData.estado === "en_proceso") {
      setView("in_progress");
      setIsRouteAlreadyCompleted(false);
    } else if (routeData.estado === "completada") {
      setView("completed");
      setIsRouteAlreadyCompleted(true); // Ya estaba completada antes
    }
  }, [routeData]);

  // Cargar datos según vista
  useEffect(() => {
    if (!isOpen || !routeData) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const details = await routeService.getById(routeData.id);
        setRouteDetails(details);

        // Cargar nombres de todos los clientes al inicio (vista pendiente)
        if (details.estado === "pendiente" && details.detalles.length > 0) {
          const clientPromises = details.detalles.map((detalle: any) =>
            routeService
              .getClientDetail(routeData.id, detalle.id)
              .then((clientData) => ({ id: detalle.id, data: clientData }))
              .catch((err) => {
                console.error(`Error loading client ${detalle.id}:`, err);
                return null;
              })
          );

          const clientResults = await Promise.all(clientPromises);
          const clientsMap = clientResults.reduce(
            (acc, result) => {
              if (result) {
                acc[result.id] = result.data;
              }
              return acc;
            },
            {} as Record<number, any>
          );

          setClientDetails(clientsMap);
        }

        if (details.estado === "en_proceso") {
          const nextClient = await routeService.getNextClient(routeData.id);
          setCurrentClient(nextClient);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar información");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, routeData, view]);

  // Cargar detalles de un cliente específico cuando se expande
  const loadClientDetails = async (routeId: number, detailId: number) => {
    if (clientDetails[detailId]) return; // Ya está cargado

    try {
      const details = await routeService.getClientDetail(routeId, detailId);
      setClientDetails((prev) => ({
        ...prev,
        [detailId]: details,
      }));
    } catch (error) {
      console.error("Error loading client details:", error);
      toast.error("Error al cargar detalles del cliente");
    }
  };

  const handleToggleClient = (detailId: number) => {
    const isExpanding = expandedClientId !== detailId;
    setExpandedClientId(isExpanding ? detailId : null);
  };

  const capitalizeName = (name: string | null | undefined): string => {
    if (!name) return "";
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "--------";
    const localDate = parseLocalDate(dateString);
    return localDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleStartRoute = async () => {
    if (!routeData) return;

    setSubmitting(true);
    try {
      await routeService.startRoute(routeData.id);
      toast.success("Ruta iniciada exitosamente");

      // Cambiar a vista en progreso
      setView("in_progress");

      // Cargar primer cliente
      const nextClient = await routeService.getNextClient(routeData.id);
      setCurrentClient(nextClient);

      onRouteUpdated?.();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al iniciar ruta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDelivery = async () => {
    if (!routeData || !currentClient) return;

    if (estadoEntrega === "no_entregado" && !motivo.trim()) {
      toast.error("Debe especificar un motivo");
      return;
    }

    setSubmitting(true);
    try {
      if (estadoEntrega === "entregado") {
        await routeService.deliverAll(routeData.id, currentClient.detalle_id);
        toast.success("Entrega registrada exitosamente");
      } else {
        await routeService.markNotDelivered(
          routeData.id,
          currentClient.detalle_id,
          motivo
        );
        toast.success("No entrega registrada");
      }

      // Limpiar formulario
      setMotivo("");
      setEstadoEntrega("entregado");

      // Cargar siguiente cliente
      const nextClient = await routeService.getNextClient(routeData.id);

      if (!nextClient) {
        // Ya no hay más clientes
        toast.success("¡Todos los clientes visitados!");
        setView("completed");
        setIsRouteAlreadyCompleted(false); // Acabamos de completarla
      } else {
        setCurrentClient(nextClient);
      }

      onRouteUpdated?.();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al registrar entrega");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteRoute = async () => {
    if (!routeData) return;

    setSubmitting(true);
    try {
      await routeService.completeRoute(routeData.id);
      toast.success("Ruta finalizada exitosamente");
      onRouteUpdated?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al finalizar ruta");
    } finally {
      setSubmitting(false);
    }
  };

  if (!routeData) return null;

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[600px] max-h-[90vh] bg-white rounded-3xl",
      }}
      hideCloseButton={true}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-2 p-6 pb-4 shadow-sm">
              {loading ? (
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {capitalizeName(routeData.nombre)}
                  </h2>
                  <Chip
                    color={
                      view === "pending"
                        ? "primary"
                        : view === "in_progress"
                          ? "warning"
                          : "success"
                    }
                    size="lg"
                    variant="flat"
                  >
                    {view === "pending"
                      ? "Pendiente"
                      : view === "in_progress"
                        ? "En Proceso"
                        : "Completada"}
                  </Chip>
                </div>
              )}
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="loader" />
                </div>
              ) : view === "pending" ? (
                /* ===== VISTA PENDIENTE ===== */
                <div className="space-y-4">
                  {/* Info de ruta */}
                  <Card className="shadow-sm">
                    <CardBody className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Fecha de salida
                          </p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {formatDate(routeData.fecha)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Almacén de salida
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {capitalizeName(routeData.almacen_nombre) ||
                              "Sin almacén"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Packages className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Total de clientes
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {routeData.total_clientes}{" "}
                            {routeData.total_clientes === 1
                              ? "cliente"
                              : "clientes"}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Lista de clientes */}
                  {routeDetails && routeDetails.detalles.length > 0 && (
                    <Card className="shadow-sm">
                      <CardBody className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Clientes a visitar
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {routeDetails.detalles
                            .sort((a, b) => a.orden - b.orden)
                            .map((detalle, index) => {
                              const isExpanded =
                                expandedClientId === detalle.id;
                              const clientInfo = clientDetails[detalle.id];

                              return (
                                <div
                                  key={detalle.id}
                                  className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                  {/* Header clickeable */}
                                  <button
                                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onClick={() =>
                                      handleToggleClient(detalle.id)
                                    }
                                  >
                                    <span className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0">
                                      {index + 1}
                                    </span>
                                    <div className="flex-1 text-left">
                                      <p className="text-sm font-medium text-gray-900">
                                        {clientInfo
                                          ? capitalizeName(
                                              clientInfo.cliente_nombre
                                            )
                                          : `Cliente ${detalle.cliente_id}`}
                                      </p>
                                      {clientInfo && clientInfo.ordenes && (
                                        <p className="text-xs text-gray-500">
                                          {clientInfo.ordenes.length}{" "}
                                          {clientInfo.ordenes.length === 1
                                            ? "entrega"
                                            : "entregas"}
                                        </p>
                                      )}
                                    </div>
                                    <NavArrowRight
                                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                    />
                                  </button>

                                  {/* Contenido expandible */}
                                  {isExpanded && (
                                    <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                                      {clientInfo ? (
                                        <>
                                          {/* Dirección */}
                                          {(clientInfo.cliente_direccion ||
                                            clientInfo.direccion) && (
                                            <>
                                              <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                  <p className="text-xs text-gray-500 mb-1">
                                                    Dirección
                                                  </p>
                                                  <p className="text-sm text-gray-900">
                                                    {capitalizeName(
                                                      clientInfo.cliente_direccion ||
                                                        clientInfo.direccion
                                                    )}
                                                  </p>
                                                </div>
                                              </div>
                                              <Divider />
                                            </>
                                          )}

                                          {/* Productos */}
                                          <div>
                                            <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                                              <Packages className="w-4 h-4" />
                                              Productos a entregar
                                            </p>
                                            {clientInfo.ordenes &&
                                            clientInfo.ordenes.length > 0 ? (
                                              <div className="space-y-2">
                                                {clientInfo.ordenes.map(
                                                  (orden: any) => (
                                                    <div
                                                      key={orden.orden_id}
                                                      className="bg-blue-50 rounded-lg p-3"
                                                    >
                                                      <div className="flex justify-between items-center">
                                                        <div className="flex-1">
                                                          <p className="text-sm font-medium text-gray-900">
                                                            {capitalizeName(
                                                              orden.producto_nombre
                                                            )}
                                                          </p>
                                                        </div>
                                                        <Chip
                                                          color="primary"
                                                          size="sm"
                                                          variant="flat"
                                                        >
                                                          {
                                                            orden.cantidad_ordenada
                                                          }{" "}
                                                          {orden.cantidad_ordenada ===
                                                          1
                                                            ? "unidad"
                                                            : "unidades"}
                                                        </Chip>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-500 italic">
                                                Sin productos asignados
                                              </p>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex items-center justify-center py-4">
                                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ) : view === "in_progress" ? (
                /* ===== VISTA EN PROCESO ===== */
                <div className="space-y-4">
                  {currentClient ? (
                    <>
                      {/* Info del cliente */}
                      <Card className="shadow-sm border-2 border-blue-200">
                        <CardBody className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">
                                Cliente actual
                              </p>
                              <h3 className="text-xl font-bold text-gray-900">
                                {capitalizeName(currentClient.nombre)}
                              </h3>
                            </div>
                            <Chip color="primary" size="sm" variant="flat">
                              #{currentClient.orden_visita}
                            </Chip>
                          </div>

                          <Divider className="my-3" />

                          {currentClient.direccion && (
                            <div className="flex items-start gap-2 mb-3">
                              <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Dirección
                                </p>
                                <p className="text-sm text-gray-900">
                                  {capitalizeName(currentClient.direccion)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                className="rounded-full min-w-8 max-w-8 p-2"
                                onPress={() => {
                                  const wazeUrl = `https://waze.com/ul?ll=${currentClient.latitud},${currentClient.longitud}&navigate=yes`;
                                  window.open(wazeUrl, "_blank");
                                }}
                              >
                                <Image
                                  src={Waze}
                                  alt="Waze"
                                  width={25}
                                  height={25}
                                />
                              </Button>
                              <Button
                                size="sm"
                                color="success"
                                variant="flat"
                                onPress={() => {
                                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentClient.latitud},${currentClient.longitud}`;
                                  window.open(mapsUrl, "_blank");
                                }}
                              >
                                🗺️ Maps
                              </Button>
                            </div>
                          )}

                          {currentClient.telefono && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                <Phone className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                              </div>
                              <p className="text-sm text-gray-900">
                                {currentClient.telefono}
                              </p>
                            </div>
                          )}
                        </CardBody>
                      </Card>

                      {/* Productos */}
                      <Card className="shadow-sm">
                        <CardBody className="p-5">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Packages className="w-5 h-5" />
                            Productos a entregar
                          </h4>
                          <div className="space-y-2">
                            {currentClient.productos.map((producto) => (
                              <div
                                key={producto.orden_id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {capitalizeName(producto.producto_nombre)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Q{producto.precio_unitario.toFixed(2)} c/u
                                  </p>
                                </div>
                                <Chip color="primary" size="sm" variant="flat">
                                  {producto.cantidad} unidades
                                </Chip>
                              </div>
                            ))}
                          </div>
                        </CardBody>
                      </Card>

                      {/* Formulario de entrega */}
                      <Card className="shadow-sm">
                        <CardBody className="p-5 space-y-4">
                          <Select
                            label="Estado de entrega"
                            variant="bordered"
                            placeholder="Seleccione el estado"
                            selectedKeys={[estadoEntrega]}
                            size="lg"
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys)[0] as
                                | "entregado"
                                | "no_entregado";
                              setEstadoEntrega(selected);
                            }}
                          >
                            <SelectItem key="entregado">
                              ✅ Entregado
                            </SelectItem>
                            <SelectItem key="no_entregado">
                              ❌ No Entregado
                            </SelectItem>
                          </Select>

                          {estadoEntrega === "no_entregado" && (
                            <Input
                              label="Motivo de no entrega"
                              placeholder="Ej: Cliente no estaba en casa"
                              value={motivo}
                              classNames={{
                                input: "resize-none",
                                label: "text-sm font-medium text-gray-900",
                                inputWrapper: [
                                  "bg-white/60 backdrop-blur-sm border border-gray-300",
                                  "hover:bg-white/80 hover:border-white/60",
                                  "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                                  "group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                                  "transition-all duration-200",
                                  "rounded-xl",
                                ],
                              }}
                              size="lg"
                              isRequired
                              onChange={(e) => setMotivo(e.target.value)}
                            />
                          )}

                          <Button
                            className="w-full font-medium h-12"
                            color="primary"
                            size="lg"
                            isLoading={submitting}
                            onPress={handleSubmitDelivery}
                          >
                            Confirmar y Siguiente Cliente
                          </Button>
                        </CardBody>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 mb-4">
                        No hay más clientes pendientes
                      </p>
                      <Button
                        color="success"
                        size="lg"
                        onPress={handleCompleteRoute}
                      >
                        Finalizar Ruta
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* ===== VISTA COMPLETADA ===== */
                <div className="flex flex-col items-center justify-center py-10 px-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-10 h-10 text-green-600"
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

                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    ¡Ruta Completada!
                  </h3>

                  <p className="text-sm text-gray-500 text-center mb-6">
                    Todos los clientes han sido visitados
                  </p>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 gap-2">
              {view === "pending" && (
                <>
                  <Button
                    className="flex-1 font-medium"
                    variant="bordered"
                    onPress={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 font-medium"
                    color="primary"
                    isLoading={submitting}
                    onPress={handleStartRoute}
                  >
                    Comenzar Ruta
                  </Button>
                </>
              )}

              {view === "in_progress" && currentClient && (
                <Button
                  className="w-full font-medium"
                  variant="bordered"
                  onPress={() => onOpenChange(false)}
                >
                  Cerrar
                </Button>
              )}

              {view === "completed" && (
                <>
                  {isRouteAlreadyCompleted ? (
                    <Button
                      className="w-full font-medium"
                      color="primary"
                      variant="flat"
                      onPress={() => onOpenChange(false)}
                    >
                      Cerrar
                    </Button>
                  ) : (
                    <Button
                      className="w-full font-medium"
                      color="danger"
                      variant="flat"
                      isLoading={submitting}
                      onPress={handleCompleteRoute}
                    >
                      Finalizar Ruta
                    </Button>
                  )}
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
