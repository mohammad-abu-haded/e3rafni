import Script from "next/script";
import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Toast from "@/components/ui/Toast";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "اعرفني - %s",
    default: "اعرفني",
  },
  description:
    "اعرفني هي لعبة اجتماعية تنافسية تجمعك مع أصدقائك في مواجهات ممتعة، حيث يحاول كل لاعب اكتشاف كلمته السرية من خلال طرح أسئلة إجابتها نعم أو لا.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        {children}
        <Toast />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
