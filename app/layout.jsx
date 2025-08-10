import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import ProviderWrrper from "@/redux/Providers";
import ClientLayout from "@/components/ClientLayout";
import FontLoader from "@/components/FontLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Monaco", "Consolas", "monospace"],
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

export const metadata = {
  title: "QueryNest",
  description: "Ask anything, get answered instantly !",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} font-roboto antialiased`}
      >
        <FontLoader />
        <ProviderWrrper>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ProviderWrrper>
      </body>
    </html>
  );
}
