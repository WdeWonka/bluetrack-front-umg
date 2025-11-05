"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Input,
  Button,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useState, useEffect, useMemo } from "react";

import productService from "../services/product.service";

import {
  getCreateProductSchema as getUpdateProductSchema,
  CreateProductSchema as UpdateProductSchema,
} from "@/app/dashboard/products/schemas/create-product";

interface EditProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  productId: number | null;
}

export function EditProductModal({
  isOpen,
  onOpenChange,
  onSuccess,
  productId,
}: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<UpdateProductSchema>({
    nombre: "",
    precio: 0,
    stock_total: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<UpdateProductSchema>({
    resolver: zodResolver(getUpdateProductSchema()),
    defaultValues: {
      nombre: "",
      precio: 0,
      stock_total: 0,
    },
  });

  const nombre = watch("nombre");
  const precio = watch("precio");
  const stock_total = watch("stock_total");

  // Verificar si hay cambios
  const hasChanges = useMemo(() => {
    return (
      nombre !== initialData.nombre ||
      precio !== initialData.precio ||
      stock_total !== initialData.stock_total
    );
  }, [nombre, precio, stock_total, initialData]);

  // Validar que los valores sean válidos
  const hasValidInput =
    nombre &&
    nombre.trim().length >= 3 &&
    precio &&
    precio > 0 &&
    stock_total !== undefined &&
    stock_total >= 0;

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      productService
        .getProductById(productId)
        .then((product) => {
          const productData = {
            nombre: product.nombre,
            precio: product.precio,
            stock_total: product.stock_total,
          };

          // Guardar datos iniciales
          setInitialData(productData);

          // Establecer valores en el formulario
          setValue("nombre", product.nombre);
          setValue("precio", product.precio);
          setValue("stock_total", product.stock_total);
        })
        .catch(() => {
          toast.error("Error al cargar datos del producto");
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, productId, setValue, onOpenChange]);

  const onSubmit = async (data: UpdateProductSchema) => {
    if (!productId) {
      toast.error("ID de producto no válido");

      return;
    }

    try {
      const response = await productService.update(productId, {
        nombre: data.nombre,
        precio: data.precio,
        stock_total: data.stock_total,
      });

      switch (response.statusCode) {
        case 200:
          toast.success("Producto actualizado exitosamente");
          onSuccess();
          handleClose();
          break;

        case 404:
          toast.error(`El producto con ID ${productId} no existe`);
          break;

        case 422:
          toast.error("Error de validación en los datos");
          break;

        case 409:
          toast.error("Ya existe un producto con ese nombre");
          break;

        case 400:
          toast.error("Datos inválidos. Verifica la información.");
          break;

        case 500:
          toast.error("Error del servidor. Intenta nuevamente.");
          break;

        default:
          toast.error("Ocurrió un error inesperado. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Ocurrió un error inesperado. Intenta nuevamente.");
    }
  };

  const handleClose = () => {
    reset();
    setInitialData({
      nombre: "",
      precio: 0,
      stock_total: 0,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[660px] max-h-[90vh] sm:max-h-[600px] mx-3 bg-white rounded-4xl",
        closeButton: "top-4 right-4",
      }}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
              <h1 className="text-xl font-bold text-gray-900">
                Editar Producto
              </h1>
              <p className="text-sm font-normal text-gray-600">
                Modifica los datos del producto.
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : (
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    {/* Nombre */}
                    <Input
                      {...register("nombre")}
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
                      errorMessage={errors.nombre?.message}
                      isInvalid={!!errors.nombre}
                      label="Nombre del producto"
                      labelPlacement="outside"
                      placeholder="Ej: Garrafón 20 Litros"
                      variant="bordered"
                    />
                  </div>

                  {/* Precio */}
                  <Input
                    {...register("precio", { valueAsNumber: true })}
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
                    errorMessage={errors.precio?.message}
                    isInvalid={!!errors.precio}
                    label="Precio (Q)"
                    labelPlacement="outside"
                    placeholder="Ej: 125.50"
                    step="0.01"
                    type="number"
                    variant="bordered"
                  />

                  {/* Stock */}
                  <Input
                    {...register("stock_total", { valueAsNumber: true })}
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
                    errorMessage={errors.stock_total?.message}
                    isInvalid={!!errors.stock_total}
                    label="Stock Total"
                    labelPlacement="outside"
                    placeholder="Ej: 500"
                    type="number"
                    variant="bordered"
                  />
                </form>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="font-medium"
                color="default"
                isDisabled={isSubmitting || loading}
                variant="flat"
                onPress={handleClose}
              >
                Cancelar
              </Button>
              <Button
                className="font-medium bg-[#2e93d1] hover:bg-[#2e93d1]/90"
                color="primary"
                isDisabled={
                  loading || isSubmitting || !hasChanges || !hasValidInput
                }
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Actualizando..." : "Guardar cambios"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
