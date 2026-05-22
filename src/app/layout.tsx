import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ElevenLabs Widget Demo - MascotBot SDK",
  description:
    "Open-source example: embeddable ElevenLabs Conversational AI voice widget with the MascotBot lipsync SDK for transparent-background animated avatars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{ background: "transparent", backgroundColor: "transparent" }}
    >
      <body
        className="antialiased"
        style={{ background: "transparent", backgroundColor: "transparent" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
