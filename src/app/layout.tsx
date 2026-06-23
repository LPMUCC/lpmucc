import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LPMUCC // Let's Play Monopoly Using UCC",
  description: "The board was set before you arrived.",
  openGraph: {
    title: "LPMUCC // Let's Play Monopoly Using UCC",
    description: "The board was set before you arrived.",
    type: "website",
    url: "https://lpmucc.com",
  },
  twitter: {
    card: "summary",
    title: "LPMUCC // Let's Play Monopoly Using UCC",
    description: "The board was set before you arrived.",
  },
  robots: { index: true, follow: true },
  themeColor: "#04342C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#04342C" />
      </head>
      <body>{children}</body>
    </html>
  );
}
