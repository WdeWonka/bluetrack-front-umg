"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import orderService from "../services/order.service";

interface CancelOrderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
  onSuccess?: () => void;
}

export function CancelOrderModal({
  isOpen,
  onOpenChange,
  orderId,
  onSuccess,
}: CancelOrderModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      orderService
        .getOrderById(orderId)
        .then((res) => {
          setOrder(res);
        })
        .catch((err) => {
          console.error("Error fetching order:", err);
          toast.error("Error al obtener datos de la orden");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderId]);

  const handleCancelOrder = async () => {
    if (!orderId) return;

    setIsDeleting(true);
    try {
      const response = await orderService.cancel(orderId);

      // El deleteFetcher ya maneja el response, así que viene directo
      if (response) {
        toast.success("Orden cancelada exitosamente. Stock liberado.");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error canceling order:", error);

      // El error ya viene procesado por authService.handleResponse
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Error al cancelar la orden");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setOrder(null);
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[480px] bg-white rounded-4xl",
        closeButton: "top-4 right-4",
      }}
      isOpen={isOpen}
      placement="center"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
              <h1 className="text-xl font-bold text-gray-900">
                Cancelar Orden
              </h1>
              <p className="text-sm font-normal text-gray-600">
                Estás a punto de cancelar una orden
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : order ? (
                <div className="flex flex-col items-center gap-5">
                  {/* Icono de advertencia */}
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>

                  {/* Información de la orden */}
                  <div className="w-full space-y-3">
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-800 mb-2">
                        Orden a cancelar:
                      </p>
                    </div>

                    {/* Detalles de la orden */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-semibold text-gray-900">
                          {capitalizeName(order.cliente_nombre)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Producto:</span>
                        <span className="font-semibold text-gray-900">
                          {capitalizeName(order.producto_nombre)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cantidad:</span>
                        <span className="font-semibold text-gray-900">
                          {order.cantidad} unidades
                        </span>
                      </div>
                    </div>

                    {/* Advertencia sobre stock */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800 text-center">
                        💡 El stock reservado ({order.cantidad} unidades) se
                        liberará automáticamente
                      </p>
                    </div>

                    {order.asignada && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-800 text-center font-medium">
                          ⚠️ Esta orden está asignada a una ruta y no puede ser
                          cancelada
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No se encontró información de la orden
                </p>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 gap-3">
              <Button
                className="font-medium flex-1"
                color="default"
                isDisabled={isDeleting}
                variant="flat"
                onPress={handleClose}
              >
                Regresar
              </Button>
              <Button
                className="font-medium flex-1"
                color="danger"
                isDisabled={!order || loading || order?.asignada}
                isLoading={isDeleting}
                onPress={handleCancelOrder}
              >
                {isDeleting ? "Cancelando..." : "Cancelar Orden"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
