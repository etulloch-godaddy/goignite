import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorLevel — Your Business Dashboard",
  description:
    "Build your creator business one step at a time with missions, XP, and a dashboard that grows with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-white text-[#111111]">
        {children}
      </body>
    </html>
  );
}
