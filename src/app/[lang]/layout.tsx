import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import LanguageProvider from "@/contexts/LanguageContext";
import DynamicLang from "@/components/DynamicLang";
import LanguageLoadingWrapper from "@/components/LanguageLoadingWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bromo Ijen Adventure - Tour & Travel",
  description: "Discover the beauty of Bromo and Ijen with our exclusive tour packages",
};

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  
  return (
    <LanguageProvider initialLanguage={lang as any}>
      <DynamicLang lang={lang} />
      <LanguageLoadingWrapper>
        {children}
      </LanguageLoadingWrapper>
    </LanguageProvider>
  );
}
