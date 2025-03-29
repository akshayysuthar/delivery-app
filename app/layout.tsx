import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";
import { SoundProvider } from "@/context/sound-context";
import { ClerkProvider } from "@clerk/nextjs";
import MobileNavbar from "@/components/layout/mobile-navbar";
import { AuthProvider } from "@/context/auth-context";
// import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};
// function registerServiceWorker() {
//   useEffect(() => {
//     if ("serviceWorker" in navigator) {
//       window.addEventListener("load", () => {
//         navigator.serviceWorker
//           .register("/service-worker.js")
//           .then((reg) => console.log("Service Worker registered", reg))
//           .catch((err) =>
//             console.error("Service Worker registration failed", err)
//           );
//       });
//     }
//   }, []);
//   return null;
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ClerkProvider>
          <SoundProvider>
            <AuthProvider>
              <CartProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1 h-screen">{children}</main>
                  {/* {registerServiceWorker()} */}
                </div>
                <Footer />
                <MobileNavbar />
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </SoundProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
function useEffect(arg0: () => void, arg1: never[]) {
  throw new Error("Function not implemented.");
}
