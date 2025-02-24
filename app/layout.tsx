import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Car Recognizer",
  description: "Recognize any car on the road.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
