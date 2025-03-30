import type { Metadata } from "next";
import "./globals.css";
import AmplifyProvider from "./providers/AmplifyProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "What's That Car?",
  description: "Recognize any car on the road.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#000000"/>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png"/>
        <link rel="icon" href="/favicon/favicon.ico"/>
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon/android-chrome-512x512.png"/>
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
        <link rel="manifest" href="/favicon/site.webmanifest"/>
      </head>
      <body className="font-montserrat">
        <AmplifyProvider>
          <div className="flex flex-col min-h-[100dvh]">
            <Header />
            <main className="flex flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </AmplifyProvider>
      </body>
    </html>
  );
}
