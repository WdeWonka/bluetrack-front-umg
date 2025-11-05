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

import customerService from "../services/customer.service";

import {
  getCreateCustomerSchema,
  CreateCustomerSchema,
} from "@/app/dashboard/customers/schemas/create-customer";
import MapSelector from "@/components/MapSelector";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCustomerModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateCustomerModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateCustomerSchema>({
    resolver: zodResolver(getCreateCustomerSchema()),
    defaultValues: {
      nombre: "",
      telefono: "",
      direccion: "",
      latitud: 0,
      longitud: 0,
    },
  });

  const direccion = watch("direccion");
  const latitud = watch("latitud");
  const longitud = watch("longitud");

  // Validar si hay ubicación seleccionada
  const hasLocation = latitud !== 0 && longitud !== 0;

  const onSubmit = async (data: CreateCustomerSchema) => {
    if (!data.direccion || !data.latitud || !data.longitud) {
      toast.error("Por favor selecciona una ubicación en el mapa.");

      return;
    }

    try {
      const response = await customerService.create({
        nombre: data.nombre,
        telefono: data.telefono,
        direccion: data.direccion,
        latitud: data.latitud,
        longitud: data.longitud,
      });

      switch (response.statusCode) {
        case 200:
        case 201:
          toast.success("Cliente creado exitosamente");
          onSuccess();
          handleClose();
          break;
        case 404:
          toast.error(`El cliente no se pudo crear`);
          break;

        case 422:
          toast.error("Error de validación en los datos");
          break;

        case 409:
          toast.error("Hay datos dupicados ");
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
    } catch (error: any) {
      console.error("Error al crear cliente:", error);
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
                Agregar nuevo cliente
              </h1>
              <p className="text-sm font-normal text-gray-600">
                Llena los campos para crear un nuevo cliente.
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <Input
                  {...register("nombre")}
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
                  errorMessage={errors.nombre?.message}
                  isInvalid={!!errors.nombre}
                  label="Nombre"
                  labelPlacement="outside"
                  placeholder="Ej: Bantrab"
                  variant="bordered"
                />

                {/* Teléfono */}
                <Input
                  {...register("telefono")}
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
                  errorMessage={errors.telefono?.message}
                  isInvalid={!!errors.telefono}
                  label="Teléfono"
                  labelPlacement="outside"
                  placeholder="Ej: 12345678"
                  variant="bordered"
                />

                {/* Mapa */}
                <div className="col-span-1 sm:col-span-2">
                  <MapSelector
                    onLocationSelect={({ address, lat, lng }) => {
                      setValue("direccion", address, { shouldValidate: true });
                      setValue("latitud", lat, { shouldValidate: true });
                      setValue("longitud", lng, { shouldValidate: true });
                    }}
                  />
                  {errors.direccion && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.direccion.message}
                    </p>
                  )}

                  {direccion && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Dirección: {direccion}
                    </p>
                  )}
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
                isDisabled={isSubmitting || !hasLocation}
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
