import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { ThemeProvider } from "@/context/theme-provider"; // <-- your custom provider

import "./globals.css"
import AiSdkShell from "@/components/ai-sdk-shell"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FiSec Control Platform",
  description: "Unified control center for data, liquidity, fraud, and rules management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Wrap the entire app with your custom ThemeProvider */}
        <ThemeProvider>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 64)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as CSSProperties
            }
            className="min-h-svh"
          suppressHydrationWarning
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col overflow-hidden">
              {children}
              <AiSdkShell />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}
