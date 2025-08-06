import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import ProviderWrrper from "@/redux/Providers";
import ClientLayout from "@/components/ClientLayout";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Choose weights as needed
  variable: '--font-roboto', // Optional for use with Tailwind's `font-family`
});

export const metadata = {
  title: "QueryNest",
  description: "Ask anything, get answered instantly !",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} font-roboto antialiased`}
      >
        <ProviderWrrper>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ProviderWrrper>
      </body>
    </html>
  );
}
