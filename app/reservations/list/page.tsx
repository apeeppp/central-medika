"use client";

import { useEffect, useState } from "react";
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
  complaint: string;
  doctor_name: string;
  specialty: string;
};

export default function ReservationListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"Aktif" | "Selesai" | "Batal">("Aktif");
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [detailData, setDetailData] = useState<Reservation | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Reservation | null>(null);

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  const reload = async (u: User, s: "Aktif" | "Selesai" | "Batal") => {
    setLoading(true);
    try {
      const url = new URL("http://localhost:5000/api/reservations");
      url.searchParams.set("userId", String(u.id));
      url.searchParams.set("status", s);
      const res = await fetch(url.toString());
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    reload(user, status);
  }, [user, status]);

  const handleCancel = async (id: number) => {
    if (!user) return;
    setUpdatingId(id);
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

      setConfirmCancel(null);
      await reload(user, status);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) return null;

  const tabStyle = (s: "Aktif" | "Selesai" | "Batal"): React.CSSProperties => ({
    flex: 1,
    textAlign: "center",
    padding: 8,
    marginRight: 6,
    borderRadius: 10,
    border: status === s ? "2px solid white" : "1px solid white",
    cursor: "pointer",
    fontSize: 14,
    backgroundColor: status === s ? "white" : "transparent",
    color: status === s ? "black" : "white",
  });

  return (
    <>
      <div style={{ padding: 16, maxWidth: 400, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 16, color: "white" }}>Daftar Reservasi</h2>

        <div style={{ display: "flex", marginBottom: 16 }}>
          <div style={tabStyle("Aktif")} onClick={() => setStatus("Aktif")}>
            Aktif
          </div>
          <div
            style={tabStyle("Selesai")}
            onClick={() => setStatus("Selesai")}
          >
            Selesai
          </div>
          <div style={tabStyle("Batal")} onClick={() => setStatus("Batal")}>
            Batal
          </div>
        </div>

        <p style={{ marginBottom: 8, color: "white" }}>Reservasi Anda</p>

        {loading && (
          <p style={{ fontSize: 12, color: "#ccc" }}>Memuat data…</p>
        )}

        {!loading &&
          items.map((r) => {
            const tanggal = new Date(r.date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            const jam = r.time?.slice(0, 5) || "";

            return (
              <div
                key={r.id}
                style={{
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  color: "#000",
                }}
              >
                <div
                  style={{ fontWeight: "bold", fontSize: 15, color: "#000" }}
                >
                  {r.doctor_name}
                </div>

                <div style={{ fontSize: 13, color: "#333" }}>
                  {r.specialty}
                </div>

                <div
                  style={{ fontSize: 13, marginTop: 6, color: "#000" }}
                >{`${tanggal} – ${jam} WIB`}</div>

                <div style={{ fontSize: 13, marginTop: 2, color: "#000" }}>
                  Status: {r.status}
                </div>

                {r.complaint && (
                  <div
                    style={{ fontSize: 13, marginTop: 6, color: "#000" }}
                  >
                    Keluhan: {r.complaint}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <button
                    onClick={() => setDetailData(r)}
                    style={{
                      flex: 1,
                      padding: 6,
                      borderRadius: 999,
                      border: "1px solid #000",
                      background: "white",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Lihat Detail
                  </button>

                  {r.status === "Aktif" && (
                    <button
                      onClick={() => setConfirmCancel(r)}
                      disabled={updatingId === r.id}
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRadius: 999,
                        border: "none",
                        background: "black",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 12,
                        opacity: updatingId === r.id ? 0.7 : 1,
                      }}
                    >
                      {updatingId === r.id ? "Memproses..." : "Batalkan"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {!loading && items.length === 0 && (
          <p style={{ fontSize: 12, color: "#ccc" }}>
            Belum ada reservasi dengan status ini.
          </p>
        )}
      </div>

      {detailData && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
    }}
  >
    <div
      style={{
        background: "white",
        padding: 20,
        width: 320,
        borderRadius: 12,
        color: "#000",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>Detail Reservasi</h3>

      <p>
        <b>Dokter:</b> {detailData.doctor_name}
      </p>
      <p>
        <b>Spesialis:</b> {detailData.specialty}
      </p>

      <p>
        <b>Tanggal:</b>{" "}
        {new Date(detailData.date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>

      <p>
        <b>Waktu:</b> {detailData.time.slice(0, 5)} WIB
      </p>

      <p>
        <b>Status:</b> {detailData.status}
      </p>

      <p>
        <b>Keluhan:</b> {detailData.complaint || "-"}
      </p>

      <button
        onClick={() => setDetailData(null)}
        style={{
          marginTop: 15,
          width: "100%",
          padding: 8,
          borderRadius: 20,
          border: "none",
          background: "black",
          color: "white",
          cursor: "pointer",
        }}
      >
        Tutup
      </button>
    </div>
  </div>
)}


      {confirmCancel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              width: 300,
              borderRadius: 12,
              color: "#000",
            }}
          >
            <h3>Batalkan Reservasi?</h3>
            <p>
              Dokter: <b>{confirmCancel.doctor_name}</b>
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button
                onClick={() => handleCancel(confirmCancel.id)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 20,
                  border: "none",
                  background: "black",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Ya, Batalkan
              </button>

              <button
                onClick={() => setConfirmCancel(null)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 20,
                  border: "1px solid black",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
