// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-8">Página no encontrada</p>
      <Link
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        href="/dashboard"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
