"use client";

import { useRouter, usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // halaman yang tidak butuh tombol back
  const noBackButton = ["/", "/login"];

  return (
    <html lang="id">
      <body className="min-h-screen bg-black text-white relative">
        {/* TOMBOL BACK */}
        {!noBackButton.includes(pathname) && (
          <button
            onClick={() => router.back()}
            className="
              fixed top-4 left-4 z-[999]
              bg-black text-white
              rounded-full px-4 py-1
              shadow-lg
            "
          >
            ◀ Back
          </button>
        )}

        {/* ISI HALAMAN */}
        {children}
      </body>
    </html>
  );
}
