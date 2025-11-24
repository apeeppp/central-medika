"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
};

type Reservation = {
  id: number;
  date: string;
  time: string;
  status: string;
  complaint: string | null;
  doctor_name: string;
  specialty: string;
};

export default function ReservationListPage(): JSX.Element | null {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"Aktif" | "Selesai" | "Batal">("Aktif");
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const [detail, setDetail] = useState<Reservation | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  // cek login pasien
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  // ambil data reservasi sesuai status
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("userId", String(user.id));
        if (status) params.set("status", status);

        const res = await fetch(
          `http://localhost:5000/api/reservations?${params.toString()}`
        );
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, status]);

  if (!user) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatTime = (isoTime: string) => isoTime.slice(0, 5) + " WIB";

  // ubah status ke "Batal"
  const handleCancel = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Batal" }),
      });

      if (!res.ok) {
        console.error("Gagal membatalkan reservasi");
        return;
      }

      const updated = await res.json();
      setItems((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, status: updated.status } : r))
      );

      setDetail((prev) =>
        prev && prev.id === updated.id ? { ...prev, status: updated.status } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  // buka modal konfirmasi hapus
  const handleAskDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  // eksekusi hapus setelah user klik "Hapus" di modal
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `http://localhost:5000/api/reservations/${confirmDeleteId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        console.error("Gagal menghapus reservasi");
        setDeleting(false);
        return;
      }

      // buang kartu dari list
      setItems((prev) => prev.filter((r) => r.id !== confirmDeleteId));

      // kalau detail yang kebuka barusan dihapus, tutup
      setDetail((prev) =>
        prev && prev.id === confirmDeleteId ? null : prev
      );

      setDeleting(false);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) return;
    setConfirmDeleteId(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: 80,
        paddingBottom: 40,
        display: "flex",
        justifyContent: "center",
        color: "white",
      }}
    >
      <div style={{ width: "100%", maxWidth: 600, padding: "0 16px" }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Daftar Reservasi
        </h1>

        {/* tombol filter status */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {(["Aktif", "Selesai", "Batal"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                backgroundColor: status === s ? "white" : "transparent",
                color: status === s ? "black" : "white",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <h2
          style={{
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          Reservasi Anda
        </h2>

        {loading && (
          <p style={{ fontSize: 12, color: "#ccc" }}>Memuat data...</p>
        )}

        {!loading && items.length === 0 && (
          <p style={{ fontSize: 13, color: "#ccc" }}>
            Belum ada reservasi dengan status {status}.
          </p>
        )}

        {/* kartu reservasi */}
        {!loading &&
          items.map((r) => (
            <div
              key={r.id}
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                Dr. {r.doctor_name}
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>{r.specialty}</div>
              <div style={{ fontSize: 12, marginBottom: 2 }}>
                {formatDate(r.date)} — {formatTime(r.time)}
              </div>
              <div style={{ fontSize: 12, marginBottom: 2 }}>
                <span style={{ fontWeight: "bold" }}>Status:</span> {r.status}
              </div>
              {r.complaint && (
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  <span style={{ fontWeight: "bold" }}>Keluhan:</span> {r.complaint}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  onClick={() => setDetail(r)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "1px solid #ccc",
                    backgroundColor: "white",
                    cursor: "pointer",
                  }}
                >
                  Lihat Detail
                </button>

                {r.status === "Aktif" && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 999,
                      border: "none",
                      backgroundColor: "black",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Batalkan
                  </button>
                )}

                <button
                  onClick={() => handleAskDelete(r.id)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#b91c1c",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

        {/* MODAL DETAIL */}
        {detail && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: 360,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 20,
                color: "black",
              }}
            >
              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  marginBottom: 8,
                }}
              >
                Detail Reservasi
              </h3>
              <p style={{ fontSize: 13, marginBottom: 4 }}>
                <strong>Dokter:</strong> Dr. {detail.doctor_name}
              </p>
              <p style={{ fontSize: 13, marginBottom: 4 }}>
                <strong>Spesialis:</strong> {detail.specialty}
              </p>
              <p style={{ fontSize: 13, marginBottom: 4 }}>
                <strong>Tanggal:</strong> {formatDate(detail.date)}
              </p>
              <p style={{ fontSize: 13, marginBottom: 4 }}>
                <strong>Waktu:</strong> {formatTime(detail.time)}
              </p>
              <p style={{ fontSize: 13, marginBottom: 4 }}>
                <strong>Status:</strong> {detail.status}
              </p>
              <p style={{ fontSize: 13, marginBottom: 8 }}>
                <strong>Keluhan:</strong>{" "}
                {detail.complaint || "Tidak ada keluhan yang dicatat"}
              </p>

              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button
                  onClick={() => setDetail(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "black",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS */}
        {confirmDeleteId !== null && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 30,
            }}
          >
            <div
              style={{
                width: 360,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 20,
                color: "black",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                Hapus Reservasi
              </h3>
              <p style={{ fontSize: 13, marginBottom: 16 }}>
                Hapus reservasi ini secara permanen? Data tidak bisa dikembalikan.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1px solid #ccc",
                    backgroundColor: "white",
                    cursor: deleting ? "default" : "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#b91c1c",
                    color: "white",
                    cursor: deleting ? "default" : "pointer",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
