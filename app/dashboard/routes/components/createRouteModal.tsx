"use client";

import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  Spinner,
  Avatar,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { BoxIso as Package, Garage as Warehouse } from "iconoir-react";

import routeService from "../services/route.service";
import {
  getCreateRouteSchema,
  CreateRouteSchema,
} from "../schemas/create-route";

// Types
interface Seller {
  id: number;
  nombre: string;
  email: string;
}

interface WarehouseItem {
  id: number;
  nombre: string;
  direccion?: string;
}

interface OrderPreview {
  id: number;
  cliente_nombre: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface CreateRouteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateRouteModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateRouteModalProps) {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateRouteSchema>({
    resolver: zodResolver(getCreateRouteSchema()),
    defaultValues: {
      nombre: "",
      vendedor_id: 0,
      almacen_id: 0,
      fecha: "",
    },
  });

  // States
  const [sellerInputValue, setSellerInputValue] = useState("");
  const [warehouseInputValue, setWarehouseInputValue] = useState("");
  const [suggestedSellers, setSuggestedSellers] = useState<Seller[]>([]);
  const [suggestedWarehouses, setSuggestedWarehouses] = useState<
    WarehouseItem[]
  >([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseItem | null>(null);
  const [ordersPreview, setOrdersPreview] = useState<OrderPreview[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const sellerAutocompleteRef = useRef(null);
  const warehouseAutocompleteRef = useRef(null);

  const vendedorId = watch("vendedor_id");
  const almacenId = watch("almacen_id");
  const fecha = watch("fecha");

  // Search sellers
  const searchSellers = async (query: string) => {
    setLoadingSellers(true);
    try {
      const sellers = await routeService.searchSellers(query);

      setSuggestedSellers(sellers || []);
    } catch (error) {
      console.error("Error searching sellers:", error);
      toast.error("Error al buscar vendedores");
      setSuggestedSellers([]);
    } finally {
      setLoadingSellers(false);
    }
  };

  // Search warehouses
  const searchWarehouses = async (query: string) => {
    setLoadingWarehouses(true);
    try {
      const warehouses = await routeService.searchWarehouses(query);

      setSuggestedWarehouses(warehouses || []);
    } catch (error) {
      console.error("Error searching warehouses:", error);
      toast.error("Error al buscar almacenes");
      setSuggestedWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Fetch orders by date
  const fetchOrdersPreview = async (date: string) => {
    if (!date) return;

    setLoadingOrders(true);
    try {
      const orders = await routeService.getOrdersByDate(date);

      setOrdersPreview(orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar órdenes de la fecha");
      setOrdersPreview([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSellers(sellerInputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [sellerInputValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchWarehouses(warehouseInputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [warehouseInputValue]);

  useEffect(() => {
    if (fecha) {
      fetchOrdersPreview(fecha);
    } else {
      setOrdersPreview([]);
    }
  }, [fecha]);

  // Handlers
  const handleSelectSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setValue("vendedor_id", seller.id);
    setSellerInputValue("");
    setSuggestedSellers([]);
  };

  const handleSelectWarehouse = (warehouse: WarehouseItem) => {
    setSelectedWarehouse(warehouse);
    setValue("almacen_id", warehouse.id);
    setWarehouseInputValue("");
    setSuggestedWarehouses([]);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return `Q${amount.toFixed(2)}`;
  };

  const isFormValid =
    vendedorId > 0 && almacenId > 0 && fecha && ordersPreview.length > 0;

  const onSubmit = async (data: CreateRouteSchema) => {
    try {
      const response = await routeService.create({
        nombre: data.nombre,
        vendedor_id: data.vendedor_id,
        almacen_id: data.almacen_id,
        fecha: data.fecha,
      });

      if (response.statusCode === 201) {
        toast.success("Ruta creada correctamente");
        handleClose();
        onSuccess();
      } else if (response.statusCode === 400) {
        toast.error(response.error || "Datos inválidos");
      } else if (response.statusCode === 409) {
        toast.error("Ya existe una ruta para esta fecha");
      } else {
        toast.error(response.error || "Error al crear la ruta");
      }
    } catch (error: any) {
      console.error("Error creating route:", error);
      toast.error(error.message || "Error de conexión. Verifica tu internet.");
    }
  };

  const handleClose = () => {
    reset({
      nombre: "",
      vendedor_id: 0,
      almacen_id: 0,
      fecha: "",
    });
    setSelectedSeller(null);
    setSelectedWarehouse(null);
    setSellerInputValue("");
    setWarehouseInputValue("");
    setSuggestedSellers([]);
    setSuggestedWarehouses([]);
    setOrdersPreview([]);
    onOpenChange(false);
  };

  // Calculate totals
  const totalOrders = ordersPreview.length;
  const totalAmount = ordersPreview.reduce(
    (sum, order) => sum + order.subtotal,
    0,
  );
  const uniqueClients = new Set(ordersPreview.map((o) => o.cliente_nombre))
    .size;

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[800px] max-h-[90vh] mx-3 bg-white rounded-4xl",
        closeButton: "top-4 right-4",
      }}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-4 sm:px-6 pt-6 pb-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Crear nueva ruta
              </h1>
              <p className="text-xs sm:text-sm font-normal text-gray-600">
                Completa los campos para crear una ruta de entrega
              </p>
            </ModalHeader>

            <ModalBody className="px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {/* NOMBRE DE RUTA */}
                <Input
                  {...register("nombre")}
                  isRequired
                  classNames={{
                    label: "text-sm font-medium text-gray-900",
                    inputWrapper: [
                      "bg-white/60 backdrop-blur-sm border border-gray-300",
                      "hover:bg-white/80 hover:border-white/60",
                      "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                      "transition-all duration-200",
                      "rounded-xl h-[50px]",
                    ],
                    input:
                      "text-[#040444] placeholder:text-[#040444]/50 text-[14px]",
                  }}
                  errorMessage={errors.nombre?.message}
                  isInvalid={!!errors.nombre}
                  label="Nombre de la ruta"
                  labelPlacement="outside"
                  placeholder="Ej: Ruta Centro - Lunes"
                  variant="bordered"
                />

                {/* VENDEDOR */}
                <Controller
                  control={control}
                  name="vendedor_id"
                  render={({ fieldState }) => (
                    <Autocomplete
                      ref={sellerAutocompleteRef}
                      isRequired
                      allowsCustomValue={false}
                      classNames={{
                        selectorButton: "focus-within:border-gray-300",
                        base: "focus-within:border-gray-300 rounded-lg",
                      }}
                      errorMessage={fieldState.error?.message}
                      inputValue={sellerInputValue}
                      isInvalid={fieldState.invalid}
                      isLoading={loadingSellers}
                      items={suggestedSellers}
                      label="Vendedor"
                      labelPlacement="outside"
                      listboxProps={{
                        emptyContent: loadingSellers
                          ? "Cargando vendedores..."
                          : "No se encontraron vendedores.",
                      }}
                      placeholder="Buscar vendedor por nombre o email"
                      selectedKey=""
                      variant="bordered"
                      onFocus={() => {
                        if (
                          suggestedSellers.length === 0 &&
                          !sellerInputValue
                        ) {
                          searchSellers("");
                        }
                      }}
                      onInputChange={setSellerInputValue}
                    >
                      {suggestedSellers.map((seller) => (
                        <AutocompleteItem
                          key={seller.id}
                          className="py-2"
                          textValue={seller.nombre}
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <Avatar
                                className="text-xs w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-[#3580b0] via-[#2a73a1] to-[#1e5c82] text-white font-bold border border-slate-200/20 shadow-lg"
                                name={getInitials(seller.nombre)}
                                size="sm"
                              />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium truncate">
                                  {seller.nombre}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {seller.email}
                                </span>
                              </div>
                            </div>
                            <Button
                              className="border-small font-medium shadow-small flex-shrink-0"
                              radius="full"
                              size="sm"
                              variant="bordered"
                              onPress={() => handleSelectSeller(seller)}
                            >
                              Seleccionar
                            </Button>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                />

                {/* VENDEDOR SELECCIONADO */}
                {selectedSeller && (
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Vendedor seleccionado
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="text-sm w-10 h-10 rounded-full bg-gradient-to-br from-[#3580b0] via-[#2a73a1] to-[#1e5c82] text-white font-bold border border-slate-200/20 shadow-lg"
                        name={getInitials(selectedSeller.nombre)}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {selectedSeller.nombre}
                        </p>
                        <p className="text-xs text-blue-700">
                          {selectedSeller.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ALMACÉN */}
                <Controller
                  control={control}
                  name="almacen_id"
                  render={({ fieldState }) => (
                    <Autocomplete
                      ref={warehouseAutocompleteRef}
                      isRequired
                      allowsCustomValue={false}
                      classNames={{
                        selectorButton: "focus-within:border-gray-300",
                        base: "focus-within:border-gray-300 rounded-lg",
                      }}
                      errorMessage={fieldState.error?.message}
                      inputValue={warehouseInputValue}
                      isInvalid={fieldState.invalid}
                      isLoading={loadingWarehouses}
                      items={suggestedWarehouses}
                      label="Almacén"
                      labelPlacement="outside"
                      listboxProps={{
                        emptyContent: loadingWarehouses
                          ? "Cargando almacenes..."
                          : "No se encontraron almacenes.",
                      }}
                      placeholder="Buscar almacén por nombre"
                      selectedKey=""
                      variant="bordered"
                      onFocus={() => {
                        if (
                          suggestedWarehouses.length === 0 &&
                          !warehouseInputValue
                        ) {
                          searchWarehouses("");
                        }
                      }}
                      onInputChange={setWarehouseInputValue}
                    >
                      {suggestedWarehouses.map((warehouse) => (
                        <AutocompleteItem
                          key={warehouse.id}
                          className="py-2"
                          textValue={warehouse.nombre}
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-green-600 text-white font-semibold text-xs sm:text-sm rounded-full shadow-sm">
                                <Warehouse className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium truncate">
                                  {warehouse.nombre}
                                </span>
                                {warehouse.direccion && (
                                  <span className="text-xs text-gray-500 truncate">
                                    {warehouse.direccion}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              className="border-small font-medium shadow-small flex-shrink-0"
                              radius="full"
                              size="sm"
                              variant="bordered"
                              onPress={() => handleSelectWarehouse(warehouse)}
                            >
                              Seleccionar
                            </Button>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                />

                {/* ALMACÉN SELECCIONADO */}
                {selectedWarehouse && (
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                      Almacén seleccionado
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-full shadow-sm">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          {selectedWarehouse.nombre}
                        </p>
                        {selectedWarehouse.direccion && (
                          <p className="text-xs text-green-700">
                            {selectedWarehouse.direccion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* FECHA */}
                <Controller
                  control={control}
                  name="fecha"
                  render={({ field, fieldState }) => (
                    <I18nProvider locale="es-GT">
                      <DatePicker
                        isRequired
                        classNames={{
                          label: "text-sm font-medium text-gray-900",
                          inputWrapper: [
                            "bg-white/60 backdrop-blur-sm border border-gray-300",
                            "hover:bg-white/80 hover:border-white/60",
                            "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                            "transition-all duration-200",
                            "rounded-xl h-[50px]",
                          ],
                          input:
                            "text-[#040444] placeholder:text-[#040444]/50 text-[14px]",
                        }}
                        errorMessage={fieldState.error?.message}
                        isDateUnavailable={(date) => {
                          const todayDate = today(getLocalTimeZone());

                          return date.compare(todayDate) < 0;
                        }}
                        isInvalid={fieldState.invalid}
                        label="Fecha de entrega"
                        labelPlacement="outside"
                        minValue={today(getLocalTimeZone())}
                        placeholderValue={today(getLocalTimeZone())} // <-- Agrega esto para mostrar hoy como placeholder
                        value={field.value ? parseDate(field.value) : null} // <-- Cambia a null en vez de today
                        onChange={(date) => {
                          if (date) {
                            // Validar que la fecha no sea anterior a hoy
                            const todayDate = today(getLocalTimeZone());

                            if (date.compare(todayDate) < 0) {
                              toast.error(
                                "No puedes seleccionar fechas pasadas",
                              );

                              return;
                            }

                            const formattedDate = `${date.year}-${String(
                              date.month,
                            ).padStart(
                              2,
                              "0",
                            )}-${String(date.day).padStart(2, "0")}`;

                            field.onChange(formattedDate);
                          }
                        }}
                      />
                    </I18nProvider>
                  )}
                />

                {/* PREVIEW DE ÓRDENES */}
                {fecha && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Órdenes para {formatDate(fecha)}
                      </h3>
                      {!loadingOrders && ordersPreview.length > 0 && (
                        <div className="flex gap-2 items-center">
                          <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                            <span className="text-xs font-semibold text-blue-700">
                              {uniqueClients}{" "}
                              {uniqueClients === 1 ? "cliente" : "clientes"}
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                            <span className="text-xs font-semibold text-purple-700">
                              {totalOrders}{" "}
                              {totalOrders === 1 ? "orden" : "órdenes"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      {loadingOrders ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-gray-50">
                          <Spinner
                            classNames={{
                              circle1: "border-b-[#3580b0]",
                              circle2: "border-b-[#3580b0]",
                            }}
                            color="primary"
                            size="lg"
                          />
                          <p className="text-sm text-gray-500 font-medium">
                            Cargando órdenes...
                          </p>
                        </div>
                      ) : ordersPreview.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50">
                          <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            No hay órdenes para esta fecha
                          </p>
                          <p className="text-xs text-gray-500">
                            Selecciona otra fecha o crea órdenes primero
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-[280px] overflow-y-auto bg-white">
                            {ordersPreview.map((order, index) => (
                              <div
                                key={order.id}
                                className={`p-4 hover:bg-blue-50/50 transition-colors ${
                                  index !== ordersPreview.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-blue-600">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <p className="text-sm font-bold text-gray-900 truncate">
                                        {order.cliente_nombre}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate ml-8 mb-2">
                                      {order.producto_nombre}
                                    </p>
                                    <div className="flex items-center gap-3 ml-8 text-xs">
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">
                                          Cantidad:
                                        </span>
                                        <span className="font-semibold text-gray-700">
                                          {order.cantidad}
                                        </span>
                                      </div>
                                      <span className="text-gray-300">•</span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">
                                          Precio:
                                        </span>
                                        <span className="font-semibold text-gray-700">
                                          {formatCurrency(
                                            order.precio_unitario,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-base font-bold text-[#2e93d1]">
                                      {formatCurrency(order.subtotal)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* TOTAL MEJORADO */}
                          <div className="bg-gradient-to-r from-[#2e93d1] to-[#1e73b1] p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                                  Total Estimado
                                </span>
                                <span className="text-2xl font-bold text-white mt-1">
                                  {formatCurrency(totalAmount)}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                                  <p className="text-xs text-white/70">
                                    Clientes
                                  </p>
                                  <p className="text-lg font-bold text-white">
                                    {uniqueClients}
                                  </p>
                                </div>
                                <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                                  <p className="text-xs text-white/70">
                                    Órdenes
                                  </p>
                                  <p className="text-lg font-bold text-white">
                                    {totalOrders}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="font-medium"
                color="default"
                isDisabled={isSubmitting}
                variant="flat"
                onPress={handleClose}
              >
                Cancelar
              </Button>
              <Button
                className="font-medium bg-[#2e93d1] hover:bg-[#2e93d1]/90"
                color="primary"
                isDisabled={isSubmitting || !isFormValid}
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Creando..." : "Crear ruta"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
