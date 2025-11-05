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
  DateInput,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { parseDate } from "@internationalized/date";
import { User } from "iconoir-react";
import { I18nProvider } from "@react-aria/i18n";

import OrderService from "@/app/dashboard/orders/services/order.service";
import {
  getCreateOrderSchema,
  CreateOrderSchema,
} from "@/app/dashboard/orders/schemas/create-order";

interface CreateOrderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Customer {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock_disponible: number | null;
}

export function CreateOrderModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateOrderModalProps) {
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
  } = useForm<CreateOrderSchema>({
    resolver: zodResolver(getCreateOrderSchema()),
    defaultValues: {
      cliente_id: 0,
      producto_id: 0,
      cantidad: 1,
      fecha_solicitud: getTodayDate(),
    },
  });

  const [customerInputValue, setCustomerInputValue] = useState("");
  const [productInputValue, setProductInputValue] = useState("");
  const [suggestedCustomers, setSuggestedCustomers] = useState<Customer[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const customerAutocompleteRef = useRef(null);
  const productAutocompleteRef = useRef(null);

  const cantidad = watch("cantidad");
  const clienteId = watch("cliente_id");
  const productoId = watch("producto_id");

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "--------";
    const cleaned = ("" + phone).replace(/\D/g, "");

    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }

    return phone;
  };

  // 🔍 Buscar clientes (acepta query vacío)
  const searchCustomers = async (query: string) => {
    setLoadingCustomers(true);
    try {
      const customers = await OrderService.searchCustomers(query, 10);

      setSuggestedCustomers(customers || []);
    } catch (error) {
      console.error("Error searching customers:", error);
      toast.error("Error al buscar clientes");
      setSuggestedCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // 🔍 Buscar productos (acepta query vacío)
  const searchProducts = async (query: string) => {
    setLoadingProducts(true);
    try {
      const products = await OrderService.searchProducts(query, 10);

      setSuggestedProducts(products || []);
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Error al buscar productos");
      setSuggestedProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Debounce para búsquedas
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCustomers(customerInputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [customerInputValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(productInputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [productInputValue]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue("cliente_id", customer.id);
    setCustomerInputValue("");
    setSuggestedCustomers([]);
    searchCustomers("");
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setValue("producto_id", product.id);
    setProductInputValue("");

    const currentCantidad = watch("cantidad");
    const stockDisponible = product.stock_disponible ?? 0;

    if (currentCantidad > stockDisponible) {
      setValue("cantidad", stockDisponible > 0 ? stockDisponible : 1);
      if (stockDisponible > 0) {
        toast.error(
          `Cantidad ajustada al stock disponible: ${stockDisponible}`,
        );
      }
    }

    setSuggestedProducts([]);
    searchProducts("");
  };

  const handleToggleAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFullAddress(!showFullAddress);
  };

  const isFormValid =
    clienteId > 0 && productoId > 0 && cantidad > 0 && cantidad <= 1000;

  const onSubmit = async (data: CreateOrderSchema) => {
    const stockDisponible = selectedProduct?.stock_disponible ?? 0;

    if (selectedProduct && data.cantidad > stockDisponible) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}`);

      return;
    }

    try {
      const response = await OrderService.create({
        cliente_id: data.cliente_id,
        producto_id: data.producto_id,
        cantidad: data.cantidad,
        fecha_solicitud: data.fecha_solicitud || undefined,
      });

      if (response.statusCode === 201) {
        toast.success("Orden creada correctamente");
        handleClose();
        onSuccess();
      } else if (response.statusCode === 409) {
        toast.error("El cliente o producto no existe");
      } else if (response.statusCode === 400) {
        toast.error(response.error || "Datos inválidos");
      } else {
        toast.error(response.error || "Error al crear la orden");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Error de conexión. Verifica tu internet.");
    }
  };

  const handleClose = () => {
    reset({
      cliente_id: 0,
      producto_id: 0,
      cantidad: 1,
      fecha_solicitud: getTodayDate(),
    });
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setCustomerInputValue("");
    setProductInputValue("");
    setSuggestedCustomers([]);
    setSuggestedProducts([]);
    setShowFullAddress(false);
    onOpenChange(false);
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[700px] max-h-[90vh] sm:max-h-[90vh] mx-3 bg-white rounded-4xl ",
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
                Crear nueva orden
              </h1>
              <p className="text-xs sm:text-sm font-normal text-gray-600">
                Selecciona cliente, producto y cantidad para crear la orden.
              </p>
            </ModalHeader>

            <ModalBody className="px-4 sm:px-6 py-4">
              <form className="space-y-4">
                {/* 🔍 BUSCAR CLIENTE */}
                <Controller
                  control={control}
                  name="cliente_id"
                  render={({ fieldState }) => (
                    <Autocomplete
                      ref={customerAutocompleteRef}
                      isRequired
                      allowsCustomValue={false}
                      classNames={{
                        selectorButton: "focus-within:border-gray-300",
                        base: "focus-within:border-gray-300 rounded-lg",
                      }}
                      errorMessage={fieldState.error?.message}
                      inputValue={customerInputValue}
                      isInvalid={fieldState.invalid}
                      isLoading={loadingCustomers}
                      items={suggestedCustomers}
                      label="Cliente"
                      labelPlacement="outside"
                      listboxProps={{
                        emptyContent: loadingCustomers
                          ? "Cargando clientes..."
                          : "No se encontraron clientes.",
                      }}
                      placeholder="Buscar por nombre o teléfono"
                      selectedKey=""
                      variant="bordered"
                      onFocus={() => {
                        if (
                          suggestedCustomers.length === 0 &&
                          !customerInputValue
                        ) {
                          searchCustomers("");
                        }
                      }}
                      onInputChange={setCustomerInputValue}
                    >
                      {suggestedCustomers.map((customer) => (
                        <AutocompleteItem
                          key={customer.id}
                          className="py-2"
                          textValue={customer.nombre}
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-[#2e93d1] text-white font-semibold text-xs sm:text-sm rounded-full shadow-sm">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium truncate">
                                  {customer.nombre}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {customer.telefono}
                                </span>
                                <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                  {customer.direccion}
                                </span>
                              </div>
                            </div>
                            <Button
                              className="border-small font-medium shadow-small flex-shrink-0"
                              radius="full"
                              size="sm"
                              variant="bordered"
                              onPress={() => handleSelectCustomer(customer)}
                            >
                              Seleccionar
                            </Button>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                />

                {/* ✅ Cliente seleccionado */}
                {selectedCustomer && (
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Cliente seleccionado:
                    </p>

                    {/* Nombre */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                        Nombre
                      </p>
                      <p className="text-xs font-semibold text-blue-900 break-words">
                        {selectedCustomer.nombre}
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                        Teléfono
                      </p>
                      <p className="text-xs font-semibold text-blue-900">
                        {formatPhone(selectedCustomer.telefono)}
                      </p>
                    </div>

                    {/* Dirección */}
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                        Dirección
                      </p>
                      <div className="relative">
                        <p
                          className={`text-xs font-semibold text-blue-900 break-words ${
                            !showFullAddress ? "line-clamp-2" : ""
                          }`}
                        >
                          {selectedCustomer.direccion}
                        </p>
                        {selectedCustomer.direccion &&
                          selectedCustomer.direccion.length > 100 && (
                            <button
                              className="flex sm:hidden text-xs cursor-pointer text-blue-600 hover:text-blue-400 font-medium mt-1 transition-colors focus:outline-none"
                              type="button"
                              onClick={handleToggleAddress}
                            >
                              {showFullAddress ? "Ver menos" : "Ver más"}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 🔍 BUSCAR PRODUCTO */}
                <Controller
                  control={control}
                  name="producto_id"
                  render={({ fieldState }) => (
                    <Autocomplete
                      ref={productAutocompleteRef}
                      isRequired
                      allowsCustomValue={false}
                      classNames={{
                        selectorButton: "focus-within:border-gray-300",
                        base: "focus-within:border-gray-300 rounded-lg",
                      }}
                      errorMessage={fieldState.error?.message}
                      inputValue={productInputValue}
                      isInvalid={fieldState.invalid}
                      isLoading={loadingProducts}
                      items={suggestedProducts}
                      label="Producto"
                      labelPlacement="outside"
                      listboxProps={{
                        emptyContent: loadingProducts
                          ? "Cargando productos..."
                          : "No se encontraron productos.",
                      }}
                      placeholder="Buscar producto por nombre"
                      selectedKey=""
                      variant="bordered"
                      onFocus={() => {
                        if (
                          suggestedProducts.length === 0 &&
                          !productInputValue
                        ) {
                          searchProducts("");
                        }
                      }}
                      onInputChange={setProductInputValue}
                    >
                      {suggestedProducts.map((product) => (
                        <AutocompleteItem
                          key={product.id}
                          className="py-2"
                          textValue={product.nombre}
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs sm:text-sm font-medium truncate">
                                {product.nombre}
                              </span>
                              <div className="flex gap-2 text-xs text-gray-500">
                                <span>Precio: Q{product.precio}</span>
                                <span>•</span>
                                <span
                                  className={
                                    (product.stock_disponible ?? 0) > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  Stock: {product.stock_disponible ?? 0}
                                </span>
                              </div>
                            </div>
                            <Button
                              className="border-small font-medium shadow-small flex-shrink-0"
                              isDisabled={product.stock_disponible === 0}
                              radius="full"
                              size="sm"
                              variant="bordered"
                              onPress={() => handleSelectProduct(product)}
                            >
                              {product.stock_disponible === 0
                                ? "Sin stock"
                                : "Seleccionar"}
                            </Button>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                />

                {/* ✅ Producto seleccionado */}
                {selectedProduct && (
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                      Producto seleccionado
                    </p>
                    <p className="text-sm font-semibold text-green-900 break-words mb-1">
                      {selectedProduct.nombre}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-green-700">
                      <span className="font-medium">
                        Precio: Q{selectedProduct.precio}
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        Stock disponible: {selectedProduct.stock_disponible}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CANTIDAD */}
                  <Input
                    {...register("cantidad", { valueAsNumber: true })}
                    isRequired
                    classNames={{
                      label:
                        "text-sm font-medium text-gray-900 dark:text-white",
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
                    description={
                      selectedProduct
                        ? `Máximo: ${selectedProduct.stock_disponible} unidades`
                        : "Selecciona un producto primero"
                    }
                    errorMessage={errors.cantidad?.message}
                    isDisabled={!selectedProduct}
                    isInvalid={!!errors.cantidad}
                    label="Cantidad"
                    labelPlacement="outside"
                    max={selectedProduct?.stock_disponible || 1000}
                    min={1}
                    placeholder="Ej: 10"
                    type="number"
                    variant="bordered"
                  />

                  {/* FECHA SOLICITUD */}
                  <Controller
                    control={control}
                    name="fecha_solicitud"
                    render={({ field, fieldState }) => (
                      <I18nProvider locale="es-GT">
                        <DateInput
                          isRequired
                          classNames={{
                            label:
                              "text-sm font-medium text-gray-900 dark:text-white",
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
                          isInvalid={fieldState.invalid}
                          label="Fecha de entrega deseada"
                          labelPlacement="outside"
                          value={
                            field.value
                              ? parseDate(field.value)
                              : parseDate(getTodayDate())
                          }
                          variant="bordered"
                          onChange={(date) => {
                            if (date) {
                              const formattedDate = `${date.year}-${String(
                                date.month,
                              ).padStart(2, "0")}-${String(date.day).padStart(
                                2,
                                "0",
                              )}`;

                              field.onChange(formattedDate);
                            }
                          }}
                        />
                      </I18nProvider>
                    )}
                  />
                </div>
              </form>
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
                {isSubmitting ? "Creando..." : "Crear orden"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
