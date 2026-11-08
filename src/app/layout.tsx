import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { AnimateUIProvider } from "@animate-ui/react/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Organizer | Trabajos Personales y Clientes",
    template: "%s | Organizer",
  },
  description: "Organizador y gestor integral de trabajos personales y proyectos para clientes",
  applicationName: "Organizer",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Organizer",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnimateUIProvider tempo={1}>
          {children}
        </AnimateUIProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
