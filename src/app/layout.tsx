import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "../components/layout/Navbar"; // Using relative path as per last fix
import Footer from "../components/layout/Footer"; // Using relative path as per last fix


export const metadata: Metadata = {
  title: "Text Behind Image AI",
  description: "Create stunning images with text perfectly placed behind any object.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      {/* NO WHITESPACE OR NEWLINES OR COMMENTS ALLOWED DIRECTLY HERE */}
      <head>
        {/* Next.js handles most head elements through Metadata, 
            but you can add other specific tags here if needed, like favicons.
            If you don't have anything specific for <head>, you can even omit the <head></head> tags,
            as Next.js will construct it. For clarity, I'll keep it.
        */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <div className="relative flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}