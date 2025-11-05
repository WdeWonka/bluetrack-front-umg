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

import warehouseService from "../services/warehouse.service";

import {
  getCreateWarehouseSchema,
  CreateWarehouseSchema,
} from "@/app/dashboard/warehouses/schemas/create-warehouse";
import MapSelector from "@/components/MapSelector";

interface CreateWarehouseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWarehouseModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateWarehouseModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateWarehouseSchema>({
    resolver: zodResolver(getCreateWarehouseSchema()),
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

  const onSubmit = async (data: CreateWarehouseSchema) => {
    if (!data.direccion || !data.latitud || !data.longitud) {
      toast.error("Por favor selecciona una ubicación en el mapa.");

      return;
    }

    try {
      const response = await warehouseService.create({
        nombre: data.nombre,
        telefono: data.telefono,
        direccion: data.direccion,
        latitud: data.latitud,
        longitud: data.longitud,
      });

      toast.success("Almacén creado exitosamente");

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error al crear almacén:", error);

      // Manejo de errores específicos
      if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Ocurrió un error al crear el almacén");
      }
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
                Agregar nuevo almacén
              </h1>
              <p className="text-sm font-normal text-gray-600">
                Llena los campos para crear un nuevo almacén.
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
                  placeholder="Ej: Almacén Central"
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
