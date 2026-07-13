import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const gdSage = localFont({
  src: [
    {
      path: "../fonts/GDSage-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/GDSage-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gd-sage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoIgnite — Your Business Dashboard",
  description:
    "Build your creator business one step at a time with missions, XP, and a dashboard that grows with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${gdSage.variable}`}>
        <body className="min-h-full flex flex-col bg-white text-[#111111]">
        {children}
      </body>
    </html>
  );
}
