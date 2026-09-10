import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegistration } from "@/components/shared/service-worker-registration";
import { LiveStatusButton } from "@/components/shared/live-status-button";
import "./globals.css";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "PS Proteção · Supervisão de Limpeza",
    template: "%s · PS Proteção",
  },
  description:
    "App desenvolvido para HANIER Ind. Química por PS PROTEÇÃO — supervisão de limpeza com checklist, evidências fotográficas e assinatura digital.",
  applicationName: "PS Proteção",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PS Proteção",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0c1566",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <LiveStatusButton />
        <ServiceWorkerRegistration />
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "font-[family-name:var(--font-plus-jakarta)]",
            },
          }}
        />
      </body>
    </html>
  );
}
