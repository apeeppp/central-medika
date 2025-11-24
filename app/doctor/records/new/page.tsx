"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PrescriptionInput = {
  name: string;
  dose: string;
};

export default function NewRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reservationId = searchParams.get("reservationId");
  const patientName = searchParams.get("patientName");

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionInput[]>([
    { name: "", dose: "" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("doctor");
    if (!saved) {
      router.push("/doctor-login");
      return;
    }
  }, [router]);

  const handleChangePrescription = (
    index: number,
    field: "name" | "dose",
    value: string
  ) => {
    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addRow = () => {
    setPrescriptions((prev) => [...prev, { name: "", dose: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reservationId) {
      setError("Reservation ID tidak ditemukan");
      return;
    }

    try {
      setSaving(true);

      const cleanedPresc = prescriptions.filter(
        (p) => p.name.trim() !== "" && p.dose.trim() !== ""
      );

      const res = await fetch("http://localhost:5000/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: Number(reservationId),
          diagnosis,
          notes,
          prescriptions: cleanedPresc,
        }),
      });

      if (!res.ok) {
        setError("Gagal menyimpan rekam medis");
        return;
      }

      // setelah berhasil, kembali ke dashboard dokter
      router.push("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan rekam medis");
    } finally {
      setSaving(false);
    }
  };

  if (!reservationId) {
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
        <p>Reservation ID tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 360,
          backgroundColor: "#111",
          padding: 16,
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8 }}>Isi Rekam Medis</h3>
        <p style={{ fontSize: 12, margin: 0, marginBottom: 8 }}>
          Pasien: {patientName || "-"} • Reservasi #{reservationId}
        </p>

        <label style={{ fontSize: 12 }}>Diagnosa</label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          style={{
            minHeight: 60,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ddd",
            backgroundColor: "white",
            color: "black",
          }}
        />

        <label style={{ fontSize: 12 }}>Catatan Dokter</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            minHeight: 60,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ddd",
            backgroundColor: "white",
            color: "black",
          }}
        />

        <label style={{ fontSize: 12 }}>Resep Obat</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {prescriptions.map((p, idx) => (
            <div
              key={idx}
              style={{ display: "flex", gap: 6, alignItems: "center" }}
            >
              <input
                placeholder="Nama obat"
                value={p.name}
                onChange={(e) =>
                  handleChangePrescription(idx, "name", e.target.value)
                }
                style={{
                  flex: 1,
                  padding: 6,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  color: "black",
                }}
              />
              <input
                placeholder="Dosis"
                value={p.dose}
                onChange={(e) =>
                  handleChangePrescription(idx, "dose", e.target.value)
                }
                style={{
                  width: 90,
                  padding: 6,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  color: "black",
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            style={{
              marginTop: 4,
              padding: 6,
              borderRadius: 8,
              border: "1px solid #555",
              backgroundColor: "#111",
              color: "white",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            + Tambah Baris Obat
          </button>
        </div>

        {error && (
          <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>{error}</p>
        )}

        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #555",
              backgroundColor: "#111",
              color: "white",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "none",
              backgroundColor: "white",
              color: "black",
              fontSize: 12,
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
