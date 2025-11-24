"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Admin = {
  id: number;
  name: string;
  role: string;
};

type Reservation = {
  id: number;
  date: string;
  time: string;
  status: string;
  complaint: string | null;
  patient_name: string;
  doctor_name: string;
  specialty: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [items, setItems] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("admin");
    if (!saved) {
      router.push("/admin-login");
      return;
    }
    setAdmin(JSON.parse(saved));
  }, [router]);

  useEffect(() => {
    if (!admin) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (statusFilter !== "Semua") {
          params.set("status", statusFilter);
        }

        const url =
          "http://localhost:5000/api/admin/reservations" +
          (params.toString() ? "?" + params.toString() : "");

        const res = await fetch(url);
        if (!res.ok) {
          setError("Gagal memuat data");
          return;
        }

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [admin, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.push("/login");
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reservations/${id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        alert("Gagal mengubah status");
        return;
      }

      const updated = await res.json();

      setItems((prev) => {
        if (statusFilter === "Semua") {
          return prev.map((r) =>
            r.id === updated.id ? { ...r, status: updated.status } : r
          );
        }

        return prev
          .map((r) =>
            r.id === updated.id ? { ...r, status: updated.status } : r
          )
          .filter((r) => r.status === statusFilter);
      });
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status");
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (t: string) => {
    if (!t) return "-";
    return t.slice(0, 5) + " WIB";
  };

  if (!admin) return null;

  return (
    
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Dashboard Admin</h2>
            <p style={{ margin: 0, fontSize: 12 }}>
              Login sebagai: {admin.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: 8,
              borderRadius: 16,
              border: "1px solid #fff",
              backgroundColor: "black",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 14, marginRight: 8 }}>Filter status:</span>

          {["Semua", "Aktif", "Selesai", "Batal", "Tidak Hadir"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: 6,
                marginRight: 4,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                backgroundColor: statusFilter === s ? "white" : "transparent",
                color: statusFilter === s ? "black" : "white",
                fontSize: 12,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ fontSize: 12, color: "#aaa" }}>Memuat data...</p>
        )}
        {error && <p style={{ fontSize: 12, color: "red" }}>{error}</p>}

        {items.map((r) => (
          <div
            key={r.id}
            style={{
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              backgroundColor: "white",
              color: "black",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {r.patient_name} → {r.doctor_name} ({r.specialty})
            </div>

            <div style={{ fontSize: 12 }}>
              <div>
                Tanggal: {formatDate(r.date)} • {formatTime(r.time)}
              </div>
              <div>Status: {r.status}</div>
              <div>Keluhan: {r.complaint || "-"}</div>
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => updateStatus(r.id, "Aktif")}
                style={{
                  padding: 6,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#eee",
                  fontSize: 12,
                }}
              >
                Jadikan Aktif
              </button>
              <button
                onClick={() => updateStatus(r.id, "Selesai")}
                style={{
                  padding: 6,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#c8f7c5",
                  fontSize: 12,
                }}
              >
                Tandai Selesai
              </button>
              <button
                onClick={() => updateStatus(r.id, "Batal")}
                style={{
                  padding: 6,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#ffd6d6",
                  fontSize: 12,
                }}
              >
                Batalkan
              </button>
              <button
                onClick={() => updateStatus(r.id, "Tidak Hadir")}
                style={{
                  padding: 6,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#ffe9b5",
                  fontSize: 12,
                }}
              >
                Tidak Hadir
              </button>
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && !error && (
          <p style={{ fontSize: 12, color: "#aaa" }}>Belum ada reservasi.</p>
        )}
      </div>
    </div>
  );
}
