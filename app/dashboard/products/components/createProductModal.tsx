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

import productService from "../services/product.service";

import {
  getCreateProductSchema,
  CreateProductSchema,
} from "@/app/dashboard/products/schemas/create-product";

interface CreateProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateProductModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateProductModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
  } = useForm<CreateProductSchema>({
    resolver: zodResolver(getCreateProductSchema()),
    defaultValues: {
      nombre: "",
      precio: 0,
      stock_total: 0,
    },
  });

  // Watch para detectar si hay cambios en los campos
  const nombre = watch("nombre");
  const precio = watch("precio");
  const stock_total = watch("stock_total");

  // Validar que al menos se haya ingresado el nombre y tenga valores válidos
  const hasValidInput =
    nombre.trim().length >= 3 && precio > 0 && stock_total >= 0;

  const onSubmit = async (data: CreateProductSchema) => {
    try {
      const response = await productService.create(data);

      if (response.statusCode === 201) {
        toast.success("Producto creado correctamente");
        reset();
        onOpenChange(false);
        onSuccess();
      } else if (response.statusCode === 409) {
        toast.error("El producto ya existe en el sistema");
      } else {
        toast.error(response.error || "Error al crear el producto");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Error de conexión. Verifica tu internet.");
    }
  };

  const handleClose = () => {
    reset();
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
                Agregar nuevo producto
              </h1>
              <p className="text-sm font-normal text-gray-600">
                Llena los campos para crear un nuevo producto.
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="col-span-1 sm:col-span-2">
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
                    label: "text-sm font-medium text-gray-900 dark:text-white",
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
                    label: "text-sm font-medium text-gray-900 dark:text-white",
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
                isDisabled={isSubmitting || !hasValidInput}
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Creando..." : "Agregar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
