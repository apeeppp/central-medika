"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
};

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  slots: string[];
};

export default function NewReservationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [time, setTime] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  // cek user login
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  // load dokter dari backend
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const url = new URL("http://localhost:5000/api/doctors");
        if (specialty.trim() !== "") {
          url.searchParams.set("specialty", specialty.trim());
        }
        const res = await fetch(url.toString());
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [specialty]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!user || !selectedDoctor || !date || !time) {
      setMessage("Dokter, tanggal, dan waktu wajib diisi.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          doctorId: selectedDoctor.id,
          date,
          time,
          complaint,
        }),
      });

      const data = await res.json();
      console.log("HASIL RESERVASI:", data);

      if (!res.ok) {
        setMessage("Gagal menyimpan reservasi.");
        setSending(false);
        return;
      }

      // kalau sukses pindah ke daftar reservasi
      router.push("/reservations/list");
    } catch (err) {
      console.error(err);
      setMessage("Terjadi error saat mengirim data.");
      setSending(false);
    }
  }

  if (!user) return null;

  return (
    <div style={{ padding: 16, maxWidth: 400, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>Pilih Dokter</h2>

      <label>Spesialis</label>
      <input
        placeholder="Mencari Spesialisasi"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 4,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
      <p style={{ fontSize: 12, color: "#777", marginBottom: 12 }}>
        Contoh: Dermatologi, Pediatri
      </p>

      <label>Pilih Tanggal</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 16,
          borderRadius: 6,
          border: "1px solid #ccc",
          backgroundColor: "white",
          color: "black",
        }}
      />

      <p style={{ marginBottom: 8 }}>Dokter yang Tersedia</p>
      {loadingDoctors && (
        <p style={{ fontSize: 12, color: "#777" }}>Memuat data dokter…</p>
      )}

      {!loadingDoctors &&
  doctors.map((doc) => (
    <div
      key={doc.id}
      onClick={() => {
        setSelectedDoctor(doc);
        setTime("");
      }}
      style={{
        padding: 10,
        borderRadius: 10,
        border:
          selectedDoctor?.id === doc.id
            ? "2px solid black"
            : "1px solid #ddd",
        marginBottom: 8,
        cursor: "pointer",
        backgroundColor:
          selectedDoctor?.id === doc.id ? "#f5f5f5" : "white",
        color: "black", // ← ini yang bikin teksnya keliatan
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: 14 }}>{doc.name}</div>
      <div style={{ fontSize: 12, color: "#555" }}>{doc.specialty}</div>
      <div style={{ marginTop: 4, fontSize: 12, color: "#777" }}>
        Waktu Tersedia: {doc.slots.join(", ")}
      </div>
    </div>
  ))}

      {selectedDoctor && (
        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Konfirmasi Rincian Reservasi</h3>

          <div style={{ marginBottom: 8, fontSize: 14 }}>
            <div>Dokter</div>
            <div style={{ fontWeight: "bold" }}>{selectedDoctor.name}</div>
            <div style={{ fontSize: 12, color: "#777" }}>
              {selectedDoctor.specialty}
            </div>
          </div>

          <div style={{ marginBottom: 8, fontSize: 14 }}>
            <div>Tanggal</div>
            <div>{date || "-"}</div>
          </div>

          <div style={{ marginBottom: 8, fontSize: 14 }}>
            <div>Waktu</div>
            <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
                color: "white",
                backgroundColor: "black",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #ddd",
            }}
            >

              <option value="">Pilih waktu</option>
              {selectedDoctor.slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Keluhan</h3>

          <input
            placeholder="Masukkan Keluhan Singkat Anda"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 4,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <p style={{ fontSize: 12, color: "#777", marginBottom: 16 }}>
            Tolong berikan penjelasan singkat tentang kekhawatiran anda.
          </p>

          {message && (
            <p style={{ fontSize: 12, color: "red", marginBottom: 8 }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 20,
              border: "none",
              backgroundColor: "black",
              color: "white",
              cursor: "pointer",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? "Mengirim..." : "KONFIRMASI DAN KIRIM RESERVASI"}
          </button>
        </form>
      )}
    </div>
  );
}
