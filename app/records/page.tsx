"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Prescription = {
  name: string;
  dose: string;
};

type Record = {
  id: number;
  date: string;
  time: string;
  diagnosis: string;
  notes: string;
  doctor_name: string;
  specialty: string;
  prescriptions: Prescription[];
};

export default function MedicalRecordsPage() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);

        const url = new URL("http://localhost:5000/api/records");
        url.searchParams.set("userId", user.id);

        const res = await fetch(url.toString());
        const data = await res.json();

        // FIX PALING PENTING
        setRecords(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error(err);
        setRecords([]); // fallback aman
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  if (!user) return null;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Rekam Medis Pasien</h2>

      {loading && <p>Memuat data...</p>}

      {!loading && records.length === 0 && (
        <p>Belum ada rekam medis untuk akun ini.</p>
      )}

      {!loading &&
        records.length > 0 &&
        records.map((r) => (
          <div
            key={r.id}
            style={{
              backgroundColor: "white",
              color: "black",
              padding: 15,
              borderRadius: 12,
              marginBottom: 15,
            }}
          >
            <h3 style={{ marginBottom: 5 }}>{r.doctor_name}</h3>
            <p style={{ margin: 0 }}>{r.specialty}</p>

            <p style={{ marginTop: 10 }}>
              <b>Tanggal:</b> {formatDate(r.date)}
            </p>

            <p>
              <b>Waktu:</b> {r.time}
            </p>

            <p>
              <b>Diagnosis:</b> {r.diagnosis}
            </p>

            <p>
              <b>Catatan:</b> {r.notes}
            </p>

            {r.prescriptions.length > 0 && (
              <div>
                <b>Resep Obat:</b>
                {r.prescriptions.map((p, i) => (
                  <div key={i}>
                    • {p.name} — {p.dose}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
