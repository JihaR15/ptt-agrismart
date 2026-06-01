import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  documentId,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface DeviceDetail {
  id: string;
  name: string;
}

interface Anomaly {
  server_time: string;
  temperature: number;
  humidity: number;
}

interface AnalyticsData {
  deviceId: string;
  lastUpdated: string;
  analyticsTime: string;
  statistics: {
    avg_suhu: number;
    avg_tandon: number;
    kelembapan_tanah_terendah: number;
    suhu_tertinggi: number;
    total_data_processed: number;
  };
  anomalies: Anomaly[];
}

const AnalyticsPage: React.FC = () => {
  const { data: session, status } = useSession();

  const [devices, setDevices] = useState<DeviceDetail[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isDevicesLoading, setIsDevicesLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;

    const q = query(collection(db, "users"), where("email", "==", session.user.email));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        const liveDeviceIds: string[] = userData.allowedDevices || [];

        if (liveDeviceIds.length > 0) {
          try {
            const devicesQuery = query(
              collection(db, "devices"),
              where(documentId(), "in", liveDeviceIds),
            );
            const devicesSnapshot = await getDocs(devicesQuery);

            const devicesData = devicesSnapshot.docs.map((d) => ({
              id: d.id,
              name: d.data().name || d.id,
            }));

            setDevices(devicesData);
          } catch (error) {
            console.error("Gagal mengambil nama perangkat:", error);
            setDevices([]);
          }
        } else {
          setDevices([]);
        }
      } else {
        setDevices([]);
      }
      setIsDevicesLoading(false);
    });

    return () => unsubscribe();
  }, [session?.user?.email]);

  useEffect(() => {
    if (devices.length > 0 && (!selectedDevice || !devices.find((d) => d.id === selectedDevice))) {
      setSelectedDevice(devices[0].id);
    } else if (devices.length === 0) {
      setSelectedDevice("");
    }
  }, [devices, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) {
      setAnalyticsData(null);
      return;
    }

    setIsAnalyticsLoading(true);
    const docRef = doc(db, "analytics_results", selectedDevice);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setAnalyticsData(docSnap.data() as AnalyticsData);
        } else {
          setAnalyticsData(null);
        }
        setIsAnalyticsLoading(false);
      },
      (error) => {
        console.error("Gagal mengambil data analitik:", error);
        setIsAnalyticsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedDevice]);

  const formatTanggal = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatJam = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading" || (status === "authenticated" && isDevicesLoading)) {
    return (
      <div className="flex-1 flex items-center justify-center h-[80vh]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      </div>
    );
  }

  // Persiapan Data untuk Grafik Recharts
  const chartData = analyticsData
    ? [
        {
          name: "Rata-rata Suhu",
          Suhu: analyticsData.statistics.avg_suhu,
          fill: "#006947", // Warna hijau primary
        },
        {
          name: "Suhu Tertinggi (Ekstrem)",
          Suhu: analyticsData.statistics.suhu_tertinggi,
          fill: "#ea580c", // Warna oranye peringatan
        },
      ]
    : [];

  return (
    <>
      <Head>
        <title>Analisis Cerdas | AgriSmart</title>
      </Head>

      {devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
          <div className="max-w-md w-full text-center flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-emerald-50/40 flex items-center justify-center mb-8 relative overflow-hidden backdrop-blur-sm">
              <span className="material-symbols-outlined text-emerald-300 relative z-10" style={{ fontSize: "100px" }}>insights</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-on-surface mb-3 tracking-tight">Belum Ada Perangkat</h3>
            <p className="font-body text-on-surface-variant mb-10 leading-relaxed px-4">
              Tambahkan perangkat di dasbor untuk mulai melihat ringkasan cerdas tanaman Anda.
            </p>
          </div>
        </div>
      ) : (
        <>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative">
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="appearance-none bg-surface-container-lowest border border-emerald-100 rounded-xl px-4 py-2.5 pr-10 text-sm font-headline font-semibold text-emerald-900 focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer shadow-sm outline-none transition-all duration-300 ease-in-out"
              >
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>{device.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none text-xl">
                keyboard_arrow_down
              </span>
            </div>
          </div>

          {isAnalyticsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-xl border border-emerald-50">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
              <p className="text-sm font-semibold text-on-surface-variant">Menyusun laporan cerdas tanaman Anda...</p>
            </div>
          ) : !analyticsData ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-xl border border-emerald-50">
              <span className="material-symbols-outlined text-emerald-200 text-6xl mb-4">hourglass_empty</span>
              <h3 className="text-lg font-bold text-on-surface mb-2">Data Belum Tersedia</h3>
              <p className="text-sm text-on-surface-variant">Sistem sedang mengumpulkan data. Silakan kembali beberapa saat lagi.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in">

              <div className={`p-6 rounded-2xl border ${analyticsData.anomalies.length > 0 ? "bg-orange-50 border-orange-200" : "bg-emerald-50 border-emerald-200"} shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4`}>
                <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center ${analyticsData.anomalies.length > 0 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
                  <span className="material-symbols-outlined text-3xl">
                    {analyticsData.anomalies.length > 0 ? "wb_sunny" : "psychiatry"}
                  </span>
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${analyticsData.anomalies.length > 0 ? "text-orange-800" : "text-emerald-800"} mb-1`}>
                    Kesimpulan Cerdas Kondisi Tanaman
                  </h2>
                  <p className={`text-sm ${analyticsData.anomalies.length > 0 ? "text-orange-700" : "text-emerald-700"} leading-relaxed`}>
                    {analyticsData.anomalies.length > 0 
                      ? `Peringatan: Tanaman Anda sempat mengalami suhu sangat panas hingga mencapai ${analyticsData.statistics.suhu_tertinggi}°C sebanyak ${analyticsData.anomalies.length} kali. Pastikan tanaman tidak kekurangan air atau buat peneduh jika diperlukan.`
                      : `Luar Biasa! Berdasarkan analisis riwayat data, suhu dan kelembapan di sekitar tanaman Anda sangat stabil dan optimal hari ini.`}
                  </p>
                  <p className="text-xs mt-2 opacity-75 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">history</span> 
                    Analisis terakhir: {formatTanggal(analyticsData.lastUpdated)} pukul {formatJam(analyticsData.lastUpdated)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">thermometer</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold">Suhu Normal Harian</p>
                    <p className="text-2xl font-bold text-gray-800">{analyticsData.statistics.avg_suhu}°C</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-orange-50 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">local_fire_department</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold">Suhu Paling Panas</p>
                    <p className="text-2xl font-bold text-orange-600">{analyticsData.statistics.suhu_tertinggi}°C</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-blue-50 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">opacity</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold">Kelembapan Tanah Min</p>
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.statistics.kelembapan_tanah_terendah}%</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-purple-50 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">water</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold">Stok Air Rata-rata</p>
                    <p className="text-2xl font-bold text-purple-600">{analyticsData.statistics.avg_tandon}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-emerald-50 shadow-sm">
                  <h3 className="text-lg font-bold text-on-surface mb-1">Visualisasi Suhu</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Perbandingan antara kondisi normal dengan lonjakan suhu tertinggi.</p>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#4b5563", fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} unit="°C" />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        />
                        <ReferenceLine y={32} label={{ position: 'top', value: 'Batas Panas (32°C)', fill: 'red', fontSize: 10 }} stroke="red" strokeDasharray="3 3" />
                        <Bar dataKey="Suhu" radius={[6, 6, 0, 0]} barSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl border border-emerald-50 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-emerald-50">
                    <h3 className="text-lg font-bold text-on-surface mb-1">Catatan Waktu Cuaca Terik</h3>
                    <p className="text-sm text-on-surface-variant">Daftar waktu spesifik kapan tanaman mengalami kepanasan.</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto max-h-64 bg-gray-50/50">
                    {analyticsData.anomalies.length > 0 ? (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-gray-600">Jam Kejadian</th>
                            <th className="px-6 py-3 font-semibold text-gray-600">Suhu (°C)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {analyticsData.anomalies.map((anom, idx) => (
                            <tr key={idx} className="hover:bg-white transition-colors">
                              <td className="px-6 py-4 text-gray-700 font-medium">
                                {formatTanggal(anom.server_time)}, <span className="font-bold">{formatJam(anom.server_time)}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold bg-orange-100 text-orange-700">
                                  {anom.temperature}°C
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                          <span className="material-symbols-outlined text-2xl text-emerald-600">verified</span>
                        </div>
                        <p className="text-emerald-800 font-bold">Tanaman Aman</p>
                        <p className="text-sm text-emerald-600/80">Tidak tercatat suhu ekstrem yang mengganggu kenyamanan tanaman.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AnalyticsPage;