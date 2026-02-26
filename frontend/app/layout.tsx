import type { Metadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css";
import { Zen_Maru_Gothic, Comfortaa } from "next/font/google";
import { AppShell } from "../components/AppShell";
import "./globals.css";

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaScope",
  description: "目の前のモノや現象を起点に、社会・産業・資源構造まで理解できる探索型アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaru.variable} ${comfortaa.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
