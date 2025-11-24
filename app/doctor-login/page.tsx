"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Username atau password salah");
        return;
      }

      const data = await res.json();
      localStorage.setItem("doctor", JSON.stringify(data));
      router.push("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Gagal login");
    }
  };

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
      <form
        onSubmit={handleSubmit}
        style={{ width: 300, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 16 }}>Dokter</h2>
        <label style={{ fontSize: 12 }}>Username</label>
        <input
  placeholder="username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  style={{
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "white",
    color: "black",
  }}
/>

<label style={{ fontSize: 12 }}>Password</label>
<input
  type="password"
  placeholder="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  style={{
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "white",
    color: "black",
  }}
/>

        {error && (
          <p style={{ color: "red", fontSize: 12 }}>{error}</p>
        )}
        <button
          type="submit"
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: 24,
            border: "none",
            backgroundColor: "white",
            color: "black",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
