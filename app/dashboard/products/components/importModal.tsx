"use client";

import { useState, useRef, DragEvent } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { ShareIos, JournalPage } from "iconoir-react";
import { toast } from "react-hot-toast";

import productService from "../services/product.service";

import { TrashIcon } from "@/components/icons";

interface ImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = [
    ".xlsx",
    ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile && isValidExcelFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const isValidExcelFile = (file: File): boolean => {
    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    const isUnderLimit = file.size <= 1024 * 1024 * 1024; // 1 GB

    return isExcel && isUnderLimit;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile && isValidExcelFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleBrowseKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const downloadTemplate = async () => {
    toast.loading("Descargando plantilla...");
    try {
      await productService.downloadTemplate();
      toast.dismiss();
      toast.success("Plantilla descargada");
    } catch {
      toast.dismiss();
      toast.error("Error al descargar la plantilla");
    }
  };

  const handleConfirm = async () => {
    if (!file) return;

    // Cerrar el modal inmediatamente
    onOpenChange(false);

    // Mostrar toast de loading
    const loadingToast = toast.loading("Importando productos...");

    try {
      const data = await productService.importFromExcel(file);

      // Limpiar el archivo
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // La respuesta del backend tiene esta estructura:
      // { statusCode: number, message: string, response: {...}, error: null }
      const statusCode = data.statusCode;
      const {
        created_count = 0,
        error_count = 0,
        db_errors = [],
        validation_errors = [],
      } = data.response || {};

      // Extraer nombres de productos duplicados
      const duplicateNames = db_errors
        .filter((err: any) => err.error?.includes("Ya existe"))
        .map((err: any) => err.data?.nombre)
        .filter(Boolean);

      // 🔴 CASO 1: Todos duplicados (409)
      if (statusCode === 409 || (created_count === 0 && db_errors.length > 0)) {
        toast.error("Todos los productos ya existen en el sistema", {
          duration: 1000,
        });

        if (duplicateNames.length > 0) {
          setTimeout(() => {
            const namesText = duplicateNames.slice(0, 3).join(", ");
            const moreText =
              duplicateNames.length > 3
                ? ` y ${duplicateNames.length - 3} más`
                : "";

            toast(
              (t) => (
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    {duplicateNames.length}{" "}
                    {duplicateNames.length === 1
                      ? "producto duplicado"
                      : "productos duplicados"}
                    : {namesText}
                    {moreText}
                  </span>
                  <button
                    className="text-gray-400 hover:text-gray-600 font-bold"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    ✕
                  </button>
                </div>
              ),
              {
                duration: 6000,
                style: {
                  background: "#FFFFFF",
                  color: "#000000",
                },
              },
            );
          }, 500);
        }

        return;
      }

      // ❌ CASO 2: Errores de validación (422)
      if (statusCode === 422 || validation_errors.length > 0) {
        toast.error("Verifica el formato del archivo Excel", {
          duration: 5000,
        });

        if (validation_errors.length > 0) {
          setTimeout(() => {
            const errorDetails = validation_errors
              .slice(0, 3)
              .map((err: any) => `Fila ${err.row}: ${err.error}`)
              .join("; ");

            toast(
              (t) => (
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    Errores de formato: {errorDetails}
                  </span>
                  <button
                    className="text-gray-400 hover:text-gray-600 font-bold"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    ✕
                  </button>
                </div>
              ),
              {
                duration: 7000,
                style: {
                  background: "#FFFFFF",
                  color: "#000000",
                },
              },
            );
          }, 500);
        }

        return;
      }

      // ✅ CASO 3: Todos exitosos (201)
      if (statusCode === 201 || (created_count > 0 && error_count === 0)) {
        onSuccess?.();
        toast.success(
          created_count === 1
            ? "Producto importado correctamente"
            : "Todos los productos importados correctamente",
          { duration: 4000 },
        );

        return;
      }

      // 🟡 CASO 4: Importación parcial (207)
      if (statusCode === 207 || (created_count > 0 && error_count > 0)) {
        onSuccess?.();
        const totalProcessed = created_count + error_count;

        toast.success(
          `Se ${created_count === 1 ? "importó" : "importaron"} ${created_count} de ${totalProcessed} ${totalProcessed === 1 ? "producto" : "productos"}`,
          { duration: 4000 },
        );

        // Mostrar detalles de duplicados
        if (duplicateNames.length > 0) {
          setTimeout(() => {
            const namesText = duplicateNames.slice(0, 3).join(", ");
            const moreText =
              duplicateNames.length > 3
                ? ` y ${duplicateNames.length - 3} más`
                : "";

            toast(
              (t) => (
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    {duplicateNames.length}{" "}
                    {duplicateNames.length === 1
                      ? "producto duplicado"
                      : "productos duplicados"}
                    : {namesText}
                    {moreText}
                  </span>
                  <button
                    className="text-gray-400 hover:text-gray-600 font-bold"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    ✕
                  </button>
                </div>
              ),
              {
                duration: 7000,
                style: {
                  background: "#FFFFFF",
                  color: "#000000",
                },
              },
            );
          }, 500);
        }

        return;
      }

      // Fallback
      toast.success("Productos procesados", { duration: 4000 });
    } catch (error: any) {
      // Limpiar archivo en caso de error
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Manejar errores del backend
      const errorMessage =
        error.message || "Error de conexión. Verifica tu internet.";

      toast.error(errorMessage, { duration: 5000 });
    }
  };

  const handleCancel = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[300px] w-full max-w-[600px] max-h-[90vh] sm:max-h-[600px] mx-4 bg-white rounded-4xl",
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Importar Archivo
              </h1>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Sube un archivo Excel (.xlsx, .xls) para importar los datos
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              <input
                ref={fileInputRef}
                accept={acceptedFormats.join(",")}
                className="hidden"
                type="file"
                onChange={handleFileSelect}
              />

              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6
                  transition-all duration-200 cursor-pointer
                  flex flex-col items-center justify-center
                  min-h-[180px]
                  ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900/50"
                  }
                `}
                role="button"
                tabIndex={0}
                onClick={handleBrowse}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onKeyDown={handleBrowseKeyDown}
              >
                <ShareIos
                  className={`w-12 h-12 mb-3 ${
                    isDragging
                      ? "text-blue-500"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                />
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Arrastra tu archivo aquí o{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    explora
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Tamaño máximo de archivo hasta 1 GB
                </p>
              </div>
              <div className=" mt-[-8px] flex justify-center">
                <Button
                  className="text-blue-600 dark:text-blue-400   hover:text-blue-700 dark:hover:text-blue-300"
                  size="sm"
                  startContent={<JournalPage className="w-4 h-4" />}
                  variant="light"
                  onPress={downloadTemplate}
                >
                  Descargar plantilla de ejemplo
                </Button>
              </div>

              {file && (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                    Subido
                  </h2>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <JournalPage className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      aria-label="Eliminar archivo"
                      className="flex-shrink-0 ml-3 p-1.5 cursor-pointer hover:bg-red-300/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={handleRemoveFile}
                    >
                      <TrashIcon className="w-5 h-5 text-red-600  dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="font-medium"
                color="default"
                variant="flat"
                onPress={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                className="font-medium bg-[#2e93d1] hover:bg-[#2383c6] "
                color="primary"
                isDisabled={!file}
                onPress={handleConfirm}
              >
                Confirmar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
