import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Web — WP See",
  description: "Wrapper mobile per utilizzare WhatsApp Web a schermo intero",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WhatsApp Web",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#008069",
};

export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
