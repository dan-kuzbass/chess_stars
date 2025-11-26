import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ProtectedRoute from "@/components/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess Stars",
  description: "Chess coaching platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProtectedRoute>{children}</ProtectedRoute>
      </body>
    </html>
  );
}
