"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  if (!user) return null;

  const baseButton: React.CSSProperties = {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 20,
    border: "1px solid black",
    background: "white",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>
        Hallo, {user.name}
      </h2>

      <div style={{ maxWidth: 320, margin: "0 auto" }}>
        <button
          style={{
            ...baseButton,
            background: "black",
            color: "white",
          }}
          onClick={() => router.push("/reservations/list")}
        >
          Lihat Status & Riwayat
        </button>

        <button
          style={{
            ...baseButton,
            background: "black",
            color: "white",
          }}
          onClick={() => router.push("/records")}
        >
          Lihat Rekam Medis
        </button>

        <button
          style={{
            ...baseButton,
            background: "black",
            color: "white",
          }}
          onClick={() => router.push("/reservations/new")}
        >
          Buat Reservasi Baru
        </button>
      </div>
    </div>
  );
}
