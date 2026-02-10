import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElevenLabs Widget Demo - Mascot Bot SDK",
  description: "Open-source example demonstrating ElevenLabs voice AI widget integration with Mascot Bot SDK for embeddable animated avatars with transparent backgrounds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "transparent", backgroundColor: "transparent" }}>
      <body className="antialiased" style={{ background: "transparent", backgroundColor: "transparent" }}>
        {children}
      </body>
    </html>
  );
}
