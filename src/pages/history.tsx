import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  endBefore,
  limitToLast,
  getCountFromServer,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ActionStatus =
  | "Stabil"
  | "Penyiraman Otomatis"
  | "Peringatan: Kelembapan Tinggi";

interface HistoryLog {
  id: string;
  date: string;
  time: string;
  moisture: number;
  temperature: number;
  action: ActionStatus;
}

interface UserDevice {
  id: string;
  name: string;
}

const PAGE_SIZE = 10;

// Fungsi anti-error untuk membaca berbagai format tanggal dari database
const parseFirestoreDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (typeof timestamp.toDate === "function") return timestamp.toDate();
  if (typeof timestamp === "number") return new Date(timestamp);
  if (typeof timestamp === "string") return new Date(timestamp);
  if (timestamp instanceof Date) return timestamp;
  return new Date();
};

const History: React.FC = () => {
  const { data: session } = useSession(); // Ambil data session user

  const [historyData, setHistoryData] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // === STATE UNTUK DATA PERANGKAT USER ===
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  // === STATE UNTUK FILTER (UI State) ===
  const [uiTimeRange, setUiTimeRange] = useState("Semua Waktu");
  const [uiDeviceSensor, setUiDeviceSensor] = useState("Semua Perangkat");
  const [uiActionStatus, setUiActionStatus] = useState("Semua Status");

  const [isExporting, setIsExporting] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    timeRange: "Semua Waktu",
    actionStatus: "Semua Status",
    deviceSensor: "Semua Perangkat",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);

  const startItemIndex =
    historyData.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItemIndex = startItemIndex + historyData.length - 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // 1. FETCH PERANGKAT MILIK USER
  useEffect(() => {
    const fetchUserDevices = async () => {
      if (!session?.user?.email) return;

      try {
        const q = query(
          collection(db, "devices"),
          where("ownerEmail", "==", session.user.email)
        );
        const snapshot = await getDocs(q);
        const devices: UserDevice[] = [];
        snapshot.forEach((doc) => {
          devices.push({ id: doc.id, name: doc.data().name });
        });
        setUserDevices(devices);
      } catch (error) {
        console.error("Gagal mengambil perangkat user:", error);
      } finally {
        setDevicesLoading(false);
      }
    };

    fetchUserDevices();
  }, [session]);

  const formatSnapshot = (snapshot: any) => {
    const data: HistoryLog[] = [];
    snapshot.forEach((doc: any) => {
      const item = doc.data();
      const dateObj = parseFirestoreDate(item.timestamp);
      data.push({
        id: doc.id,
        date: dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        time: dateObj.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        moisture: item.moisture || 0,
        temperature: item.temperature || 0,
        action: item.action || "Stabil",
      });
    });
    return data;
  };

  const getQueryConstraints = useCallback(() => {
    const constraints: QueryConstraint[] = [];

    // Filter Kepemilikan Perangkat
    if (activeFilters.deviceSensor !== "Semua Perangkat") {
      constraints.push(where("deviceId", "==", activeFilters.deviceSensor));
    } else {
      // Jika "Semua Perangkat", pastikan HANYA mengambil dari device miliknya
      if (userDevices.length > 0) {
        const deviceIds = userDevices.map((d) => d.id);
        constraints.push(where("deviceId", "in", deviceIds));
      } else {
        // Jika user tidak punya device satupun, cegah tampil data apapun
        constraints.push(where("deviceId", "==", "NO_DEVICES"));
      }
    }

    if (activeFilters.actionStatus !== "Semua Status") {
      let statusValue = activeFilters.actionStatus;
      if (statusValue === "Peringatan Kritis")
        statusValue = "Peringatan: Kelembapan Tinggi";
      constraints.push(where("action", "==", statusValue));
    }

    if (activeFilters.timeRange !== "Semua Waktu") {
      const now = new Date();
      let startDate = new Date();

      if (activeFilters.timeRange === "7 Hari Terakhir") {
        startDate.setDate(now.getDate() - 7);
      } else if (activeFilters.timeRange === "30 Hari Terakhir") {
        startDate.setDate(now.getDate() - 30);
      } else if (activeFilters.timeRange === "Bulan Ini") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      constraints.push(where("timestamp", ">=", startDate));
    }

    constraints.push(orderBy("timestamp", "desc"));
    return constraints;
  }, [activeFilters, userDevices]);

  const fetchInitialData = useCallback(async () => {
    const historyRef = collection(db, "history-log2");
    const constraints = getQueryConstraints();

    try {
      const countQuery = query(historyRef, ...constraints);
      const countSnapshot = await getCountFromServer(countQuery);
      setTotalCount(countSnapshot.data().count);

      const q = query(historyRef, ...constraints, limit(PAGE_SIZE));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setFirstVisible(snapshot.docs[0]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHistoryData(formatSnapshot(snapshot));
        setIsLastPage(snapshot.docs.length < PAGE_SIZE);
      } else {
        setHistoryData([]);
        setFirstVisible(null);
        setLastVisible(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data awal:", error);
      if (String(error).includes("index")) {
        alert(
          "Firebase Index Error: Buka Console Browser (F12)! Klik link dari Firebase untuk membuat Index Query untuk deviceId dan timestamp."
        );
      }
    }
  }, [getQueryConstraints]);

  // Pantau perubahan agar history berjalan HANYA setelah device loading selesai
  useEffect(() => {
    if (devicesLoading) return; // Tunggu pengecekan perangkat selesai

    const loadData = async () => {
      setLoading(true);
      if (userDevices.length === 0) {
        // Jika tidak punya perangkat, tidak perlu query ke history
        setHistoryData([]);
        setTotalCount(0);
      } else {
        await fetchInitialData();
      }
      setLoading(false);
    };
    loadData();
  }, [fetchInitialData, devicesLoading, userDevices.length]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setActiveFilters({
      timeRange: uiTimeRange,
      actionStatus: uiActionStatus,
      deviceSensor: uiDeviceSensor,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await fetchInitialData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const fetchNextPage = async () => {
    if (!lastVisible) return;
    setLoading(true);
    const q = query(
      collection(db, "history-log2"),
      ...getQueryConstraints(),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setFirstVisible(snapshot.docs[0]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHistoryData(formatSnapshot(snapshot));
      setCurrentPage((prev) => prev + 1);
      setIsLastPage(snapshot.docs.length < PAGE_SIZE);
    }
    setLoading(false);
  };

  const fetchPrevPage = async () => {
    if (!firstVisible || currentPage === 1) return;
    setLoading(true);
    const q = query(
      collection(db, "history-log2"),
      ...getQueryConstraints(),
      endBefore(firstVisible),
      limitToLast(PAGE_SIZE)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setFirstVisible(snapshot.docs[0]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHistoryData(formatSnapshot(snapshot));
      setCurrentPage((prev) => prev - 1);
      setIsLastPage(false);
    }
    setLoading(false);
  };

  const renderStatusBadge = (action: ActionStatus) => {
    switch (action) {
      case "Stabil":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Stabil
          </span>
        );
      case "Penyiraman Otomatis":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <span className="material-symbols-outlined text-[14px]">water_drop</span>{" "}
            Penyiraman Otomatis
          </span>
        );
      case "Peringatan: Kelembapan Tinggi":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <span className="material-symbols-outlined text-[14px]">warning</span> Peringatan
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const constraints = getQueryConstraints();
      const historyRef = collection(db, "history-log2");
      const q = query(historyRef, ...constraints);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Tidak ada data untuk diekspor.");
        setIsExporting(false);
        return;
      }

      const tableData: any[][] = [];
      snapshot.forEach((doc) => {
        const item = doc.data();
        const dateObj = parseFirestoreDate(item.timestamp);
        const dateStr = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const timeStr = dateObj.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        tableData.push([
          dateStr,
          timeStr,
          `${item.moisture || 0}%`,
          `${item.temperature || 0} °C`,
          item.action || "Stabil",
        ]);
      });

      const docPDF = new jsPDF("portrait", "mm", "a4");

      docPDF.setFontSize(18);
      docPDF.setTextColor(6, 78, 59);
      docPDF.text("Laporan Historis Sensor AgriSmart", 14, 22);

      docPDF.setFontSize(10);
      docPDF.setTextColor(100, 116, 139);
      docPDF.text(
        `Filter Waktu: ${activeFilters.timeRange} | Perangkat: ${activeFilters.deviceSensor}`,
        14,
        30
      );
      docPDF.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 35);

      autoTable(docPDF, {
        startY: 42,
        head: [["Tanggal", "Waktu", "Kelembapan", "Suhu", "Status Aksi"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [236, 253, 245] },
        styles: { fontSize: 9, cellPadding: 4 },
      });

      docPDF.save(`Laporan_AgriSmart_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Gagal mengekspor PDF:", error);
      alert("Terjadi kesalahan saat memproses PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-emerald-900 tracking-tight">
              Log Aktivitas Sensor
            </h2>
            <p className="text-neutral-600 mt-2 font-body">
              Monitoring perangkat aktif secara berkala dengan pembaruan tiap 10 menit berupa rata-rata.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading || devicesLoading}
              className="flex items-center justify-center gap-2 bg-white border-2 border-emerald-100 text-emerald-800 px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-emerald-50 hover:border-emerald-200 active:scale-95 transition-all disabled:opacity-50 flex-1 md:flex-none"
            >
              <span className={`material-symbols-outlined text-lg ${isRefreshing ? "animate-spin" : ""}`}>
                refresh
              </span>
              <span className="hidden sm:inline">Segarkan Data</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting || loading || historyData.length === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className={`material-symbols-outlined text-lg ${isExporting ? "animate-spin" : ""}`}>
                {isExporting ? "sync" : "picture_as_pdf"}
              </span>
              <span className="hidden sm:inline">Ekspor ke PDF</span>
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 mb-10 border border-emerald-50 shadow-sm flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[0.75rem] font-bold text-on-surface-variant px-1 uppercase tracking-wider">
              Rentang Waktu
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                calendar_today
              </span>
              <select
                value={uiTimeRange}
                onChange={(e) => setUiTimeRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary appearance-none outline-none cursor-pointer"
              >
                <option>Semua Waktu</option>
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
                <option>Bulan Ini</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[0.75rem] font-bold text-on-surface-variant px-1 uppercase tracking-wider">
              Perangkat Sensor
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                sensors
              </span>
              <select
                value={uiDeviceSensor}
                onChange={(e) => setUiDeviceSensor(e.target.value)}
                disabled={devicesLoading || userDevices.length === 0}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary appearance-none outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="Semua Perangkat">Semua Perangkat</option>
                {userDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[0.75rem] font-bold text-on-surface-variant px-1 uppercase tracking-wider">
              Status Aksi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                filter_list
              </span>
              <select
                value={uiActionStatus}
                onChange={(e) => setUiActionStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary appearance-none outline-none cursor-pointer"
              >
                <option>Semua Status</option>
                <option>Stabil</option>
                <option>Penyiraman Otomatis</option>
                <option>Peringatan Kritis</option>
              </select>
            </div>
          </div>

          <div className="flex items-end h-full self-end mt-4 lg:mt-0">
            <button
              onClick={handleApplyFilter}
              disabled={loading || devicesLoading}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all w-full disabled:opacity-50"
            >
              Terapkan Filter
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-2xl shadow-emerald-900/5 overflow-hidden mb-8 border border-emerald-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">Tanggal</th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">Waktu</th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">Kelembapan (%)</th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">Suhu (°C)</th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">Aksi Terdeteksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {devicesLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
                        <p className="text-neutral-500 font-medium">Memverifikasi perangkat pengguna...</p>
                      </div>
                    </td>
                  </tr>
                ) : userDevices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-neutral-500 font-medium">
                      Anda belum memiliki perangkat yang terdaftar.
                    </td>
                  </tr>
                ) : loading || isRefreshing ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
                        <p className="text-neutral-500 font-medium">Memuat data log perangkat...</p>
                      </div>
                    </td>
                  </tr>
                ) : historyData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-neutral-500 font-medium">
                      Tidak ada data yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  historyData.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-8 py-5 text-sm font-medium">{log.date}</td>
                      <td className="px-8 py-5 text-sm text-zinc-600 font-mono">{log.time}</td>
                      <td className="px-8 py-5 text-sm font-headline font-bold text-primary">{log.moisture}</td>
                      <td className="px-8 py-5 text-sm font-headline font-bold text-emerald-800">{log.temperature}</td>
                      <td className="px-8 py-5">{renderStatusBadge(log.action)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-4 bg-surface-container-lowest flex justify-between items-center text-sm text-neutral-500 border-t border-surface-container-low">
            <p>
              Menampilkan <span className="font-bold">{startItemIndex} - {endItemIndex}</span> dari <span className="font-bold">{totalCount.toLocaleString("id-ID")}</span> data
            </p>
            <div className="flex gap-1">
              <button
                onClick={fetchPrevPage}
                disabled={currentPage === 1 || loading || isRefreshing || devicesLoading}
                className={`w-8 h-8 flex items-center justify-center rounded border border-outline-variant transition-colors ${currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-50"}`}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-bold transition-colors">
                {currentPage}
              </button>
              {currentPage < totalPages && (
                <button
                  onClick={fetchNextPage}
                  disabled={loading || isRefreshing || devicesLoading}
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-emerald-50 transition-colors"
                >
                  {currentPage + 1}
                </button>
              )}
              <button
                onClick={fetchNextPage}
                disabled={isLastPage || loading || isRefreshing || devicesLoading}
                className={`w-8 h-8 flex items-center justify-center rounded border border-outline-variant transition-colors ${isLastPage || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-50"}`}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;