import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { AppProviders } from "@/components/AppProviders";
import { AppHeader } from "@/components/AppHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verita — Retention Vault",
  description:
    "Verita (Tahan) retention vault demo — programmatic custody of construction retention funds on Solana devnet.",
};

/**
 * Every page in this app renders wallet-derived UI with no meaningful static
 * content, so there's nothing to gain from static prerendering here.
 */
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppRouterCacheProvider options={{ key: "css" }}>
          <AppProviders>
            <AppHeader />
            <main className="flex-1">{children}</main>
          </AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
