import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Albumcito Facilito",
  description: "Colecciona y controla tus álbumes de estampas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
