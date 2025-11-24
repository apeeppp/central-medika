"use client";

import { useRouter } from "next/navigation";

export default function LoginRolePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 16 }}>Central Medika</h2>

        <button
          type="button"
          onClick={() => router.push("/patient-login")}
          style={{
            padding: 10,
            borderRadius: 24,
            border: "none",
            backgroundColor: "white",
            color: "black",
            cursor: "pointer",
          }}
        >
          Login sebagai Pasien
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin-login")}
          style={{
            padding: 10,
            borderRadius: 24,
            border: "none",
            backgroundColor: "white",
            color: "black",
            cursor: "pointer",
          }}
        >
          Login sebagai Admin
        </button>

        <button
          type="button"
          onClick={() => router.push("/doctor-login")}
          style={{
            padding: 10,
            borderRadius: 24,
            border: "none",
            backgroundColor: "white",
            color: "black",
            cursor: "pointer",
          }}
        >
          Login sebagai Dokter
        </button>
      </div>
    </div>
  );
}
