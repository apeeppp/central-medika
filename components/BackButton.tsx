"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // halaman yang tidak butuh tombol back
  const noBackButton = ["/", "/login"];

  if (noBackButton.includes(pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className="
        fixed top-4 left-4 z-[999]
        bg-black text-white
        rounded-full px-4 py-1
        shadow-lg
        hover:bg-gray-800
        transition-colors
      "
    >
      ◀ Back
    </button>
  );
}
