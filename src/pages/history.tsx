import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";

// 1. Definisi Tipe Data Historis
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

// 2. Data Dummy (Nanti Jiha akan menarik ini dari collection 'history_log' di Firebase)
const DUMMY_HISTORY: HistoryLog[] = [
  {
    id: "LOG-001",
    date: "12 Mei 2026",
    time: "14:20:05",
    moisture: 68.5,
    temperature: 24.2,
    action: "Stabil",
  },
  {
    id: "LOG-002",
    date: "12 Mei 2026",
    time: "13:45:12",
    moisture: 42.1,
    temperature: 28.5,
    action: "Penyiraman Otomatis",
  },
  {
    id: "LOG-003",
    date: "12 Mei 2026",
    time: "12:10:00",
    moisture: 70.2,
    temperature: 23.8,
    action: "Stabil",
  },
  {
    id: "LOG-004",
    date: "12 Mei 2026",
    time: "10:05:44",
    moisture: 85.4,
    temperature: 22.1,
    action: "Peringatan: Kelembapan Tinggi",
  },
  {
    id: "LOG-005",
    date: "12 Mei 2026",
    time: "09:30:15",
    moisture: 65.0,
    temperature: 25.0,
    action: "Stabil",
  },
];

const History: React.FC = () => {
  // Fungsi pembantu untuk menentukan gaya lencana (badge) berdasarkan status
  const renderStatusBadge = (action: ActionStatus) => {
    switch (action) {
      case "Stabil":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
            Stabil
          </span>
        );
      case "Penyiraman Otomatis":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <span className="material-symbols-outlined text-[14px]">
              water_drop
            </span>{" "}
            Penyiraman Otomatis
          </span>
        );
      case "Peringatan: Kelembapan Tinggi":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <span className="material-symbols-outlined text-[14px]">
              warning
            </span>{" "}
            Peringatan: Kelembapan Tinggi
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportPDF = () => {
    // TODO (Jiha): Masukkan logika untuk mengekspor tabel ini ke PDF (Bisa pakai jspdf + autoTable)
    alert("Fitur Ekspor PDF sedang dalam pengembangan!");
  };

  return (
    <DashboardLayout pageTitle="Riwayat Data Historis">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-emerald-900 tracking-tight">
              Log Aktivitas Sensor
            </h2>
            <p className="text-neutral-600 mt-2 font-body">
              Pemantauan real-time dan histori kondisi greenhouse
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">
              picture_as_pdf
            </span>
            <span>Ekspor ke PDF</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-lowest rounded-xl p-6 mb-10 border border-emerald-50 shadow-sm flex flex-wrap items-center gap-6">
          {/* Filter 1: Rentang Waktu */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label
              htmlFor="timeRange"
              className="text-[0.75rem] font-bold text-on-surface-variant px-1 uppercase tracking-wider"
            >
              Rentang Waktu
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                calendar_today
              </span>
              <select
                id="timeRange"
                aria-label="Pilih rentang waktu"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary appearance-none outline-none cursor-pointer"
              >
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
                <option>Bulan Ini</option>
                <option>Kustom Rentang</option>
              </select>
            </div>
          </div>

          {/* Filter 2: Perangkat Sensor */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label
              htmlFor="deviceSensor"
              className="text-[0.75rem] font-bold text-on-surface-variant px-1 uppercase tracking-wider"
            >
              Perangkat Sensor
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                sensors
              </span>
              <select
                id="deviceSensor"
                aria-label="Pilih perangkat sensor"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary appearance-none outline-none cursor-pointer"
              >
                <option>Semua Perangkat</option>
                <option>AGRI-001 (Tomat)</option>
                <option>AGRI-002 (Selada)</option>
              </select>
            </div>
          </div>

          {/* Filter 3: Status Aksi */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label
              htmlFor="actionStatus"
              className="text-[0.75rem] font-bold text-on-surface-variant px-1 uppercase tracking-wider"
            >
              Status Aksi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                filter_list
              </span>
              <select
                id="actionStatus"
                aria-label="Pilih status aksi"
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
            <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-colors w-full">
              Terapkan Filter
            </button>
          </div>
        </div>

        {/* Data Table Section */}
        <div
          className="bg-surface-container-lowest rounded-xl shadow-2xl shadow-emerald-900/5 overflow-hidden mb-8 border border-emerald-50"
          id="history-table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Kelembapan (%)
                  </th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Suhu (°C)
                  </th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Aksi Terdeteksi
                  </th>
                  <th className="px-8 py-4 text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {/* Looping Data Dummy */}
                {DUMMY_HISTORY.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5 text-sm font-medium">
                      {log.date}
                    </td>
                    <td className="px-8 py-5 text-sm text-zinc-600 font-mono">
                      {log.time}
                    </td>
                    <td className="px-8 py-5 text-sm font-headline font-bold text-primary">
                      {log.moisture}
                    </td>
                    <td className="px-8 py-5 text-sm font-headline font-bold text-emerald-800">
                      {log.temperature}
                    </td>
                    <td className="px-8 py-5">
                      {renderStatusBadge(log.action)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-zinc-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-4 bg-surface-container-lowest flex justify-between items-center text-sm text-neutral-500 border-t border-surface-container-low">
            <p>
              Menampilkan <span className="font-bold">1 - 5</span> dari{" "}
              <span className="font-bold">1,240</span> data historis
            </p>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-emerald-50 transition-colors">
                <span className="material-symbols-outlined text-sm">
                  chevron_left
                </span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-bold transition-colors">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-emerald-50 transition-colors">
                2
              </button>
              <span className="px-2">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-emerald-50 transition-colors">
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default History;
