"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });


      if (!res.ok) {
        setError("Username atau password salah");
        return;
      }

      const data = await res.json();
      localStorage.setItem("admin", JSON.stringify(data));

      router.push("/admin/dashboard");
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
        style={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 16 }}>
          Admin
        </h2>

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
  placeholder="password"
  type="password"
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
          <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 24,
            border: "none",
            backgroundColor: "white",
            color: "black",
            cursor: "pointer",
          }}
        >
          LOGIN
        </button>
      </form>
    </div>
  );
}
