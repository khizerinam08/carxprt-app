import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = { title: "CarXprt", description: "CarXprt product prototype with sample data.", robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: 'try{var t=localStorage.getItem("cx-theme");if(t==="dark")document.documentElement.dataset.theme="dark"}catch(e){}' }} /></head>
      <body><AppProvider><Shell>{children}</Shell></AppProvider></body>
    </html>
  );
}
