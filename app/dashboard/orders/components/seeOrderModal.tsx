"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Avatar,
  Image,
  Chip,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Calendar, Truck, User, BoxIso } from "iconoir-react";

import OrderService from "@/app/dashboard/orders/services/order.service";

interface SeeOrderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
}

export function SeeOrderModal({
  isOpen,
  onOpenChange,
  orderId,
}: SeeOrderModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "--------";
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "--------";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      OrderService.getOrderById(orderId)
        .then((res) => {
          setOrder(res);
        })
        .catch(() => {
          toast.error("Error al obtener datos de la orden");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderId]);

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[420px] max-h-[90vh] bg-white rounded-3xl",
        wrapper: "items-center",
      }}
      hideCloseButton={true}
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      placement="center"
      scrollBehavior="inside"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader
              className={`flex flex-col gap-1 p-2 pb-0 items-center relative flex-shrink-0
              ${loading ? "hidden" : "flex"}`}
            >
              <Image
                alt="clouds hero"
                className="rounded-3xl relative z-0"
                height={150}
                src="/img/clouds_hero.png"
                width={400}
              />

              <Avatar
                showFallback
                className="z-10 w-28 h-28 bg-[#2e93d1] absolute -bottom-14 left-1/2 -translate-x-1/2 border-4 border-white text-white text-3xl font-bold shadow-lg"
                fallback={<Truck className="w-15 h-15" />}
              />
            </ModalHeader>

            <ModalBody className="px-6 py-4 pb-6 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : order ? (
                <div className="flex flex-col items-center gap-5 pt-15">
                  {/* ID de Orden */}
                  <h2 className="text-2xl font-semibold text-gray-900 text-center">
                    Orden #{order.id}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-500 text-center -mt-4">
                    Detalles de la orden
                  </p>
                  {/* Estados en grid 50-50 */}
                  <div className="w-full grid grid-cols-2 gap-3">
                    {/* Estado de asignación */}
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center">
                        Estado
                      </p>
                      <Chip
                        className="capitalize"
                        color={order.asignada ? "success" : "warning"}
                        size="md"
                        variant="flat"
                      >
                        {order.asignada ? "Asignada" : "Pendiente"}
                      </Chip>
                    </div>

                    {/* Vigencia */}
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center">
                        Vigencia
                      </p>
                      <Chip
                        className="capitalize"
                        color={order.cancelada ? "danger" : "success"}
                        size="md"
                        variant="flat"
                      >
                        {order.cancelada ? "Cancelada" : "Activa"}
                      </Chip>
                    </div>
                  </div>

                  {/* Información en tarjeta */}
                  <div className="w-full bg-gray-50 rounded-2xl p-5 space-y-5 mt-1">
                    {/* Cliente */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Cliente
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {capitalizeName(order.cliente_nombre)}
                        </p>
                      </div>
                    </div>

                    {/* Producto */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BoxIso className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Producto
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {capitalizeName(order.producto_nombre)}
                        </p>
                      </div>
                    </div>

                    {/* Cantidad */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-purple-600">
                          #
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Cantidad
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.cantidad} unidades
                        </p>
                      </div>
                    </div>

                    {/* Fecha de solicitud */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Fecha de entrega
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(order.fecha_solicitud)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No se encontró información.
                </p>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 flex-shrink-0">
              <Button
                className="w-full rounded-xl font-medium h-12 bg-[#2e93d1] text-white hover:bg-[#2e93d1]/90 transition-colors"
                variant="shadow"
                onPress={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
