import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { PermissionProvider } from "@/lib/permissions";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIS Dashboard",
  description: "Management Information System Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}
      >
        <PermissionProvider>
          <div className="min-h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-72 transition-all duration-300">
              <Header />
              <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
          </div>
        </PermissionProvider>
      </body>
    </html>
  );
}
