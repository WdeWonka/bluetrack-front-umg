import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { Metadata } from "next";
import clsx from "clsx";
import { Toaster } from "react-hot-toast";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontPoppins } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="es">
      <head />
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen  font-Poppins antialiased scroll-smooth",
          fontPoppins.variable,
        )}
      >
        <Providers>{children}</Providers>
        <Toaster
          toastOptions={{
            className: "bg-white text-black",
            style: {
              background: "white",
              color: "black",
            },
          }}
        />
      </body>
    </html>
  );
}
