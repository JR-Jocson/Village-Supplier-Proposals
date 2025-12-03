import type { Metadata } from "next";
import { locales } from "@/i18n";

export const metadata: Metadata = {
  title: "Village Supplier Proposals - מערכת הצעות פרויקטים לכפרים",
  description: "Digital platform for managing village project proposals to local municipalities - פלטפורמה דיגיטלית לניהול הצעות פרויקטים",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

