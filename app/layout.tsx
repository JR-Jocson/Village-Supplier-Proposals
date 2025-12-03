import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "הצעות פרויקטים כפריים | Village Proposals",
  description: "פלטפורמה להעלאת והגשת הצעות פרויקטים כפריים לרשויות מקומיות",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he">
      <body className="antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}

