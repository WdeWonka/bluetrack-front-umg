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
} from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { DollarCircle, Truck, Calendar, BoxIso } from "iconoir-react";

import productService from "../services/product.service";

interface SeeProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number | null;
}

export function SeeProductModal({
  isOpen,
  onOpenChange,
  productId,
}: SeeProductModalProps) {
  const [product, setProduct] = useState<any>(null);
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

  const formatPrice = (price: number | null | undefined) => {
    if (!price && price !== 0) return "--------";

    return `Q ${price.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatStock = (stock: number | null | undefined) => {
    if (!stock && stock !== 0) return "--------";

    return `${stock.toLocaleString("es-GT")} unidades`;
  };

  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      productService
        .getProductById(productId)
        .then((res) => {
          setProduct(res);
        })
        .catch(() => {
          toast.error("Error al obtener datos del producto");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, productId]);

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[420px] max-h-auto bg-white rounded-3xl",
      }}
      hideCloseButton={true}
      isOpen={isOpen}
      placement="center"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader
              className={`flex flex-col gap-1 p-2 pb-0 items-center relative
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
                fallback={<BoxIso className="w-15 h-15" />}
              />
            </ModalHeader>

            <ModalBody className="px-6 py-4 pb-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : product ? (
                <div className="flex flex-col items-center gap-5 pt-15">
                  {/* Nombre */}
                  <h2 className="text-2xl font-semibold text-gray-900 text-center">
                    {capitalizeName(product.nombre)}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-500 text-center -mt-4">
                    Producto
                  </p>

                  {/* Información en tarjeta */}
                  <div className="w-full bg-gray-50 rounded-2xl p-5 space-y-5 mt-1">
                    {/* Precio */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Precio
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.precio)}
                        </p>
                      </div>
                    </div>

                    {/* Stock Total */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Stock Total
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatStock(product.stock_total)}
                        </p>
                      </div>
                    </div>

                    {/* Fecha de creación */}
                    {product.creado_en && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Fecha de creación
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(product.creado_en)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No se encontró información.
                </p>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
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
