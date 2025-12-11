import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bromo Ijen Adventure - Tour & Travel",
  description: "Discover the beauty of Bromo and Ijen with our exclusive tour packages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth">
      <body
        className={`${poppins.variable} font-poppins antialiased`}
        suppressHydrationWarning
      >
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
