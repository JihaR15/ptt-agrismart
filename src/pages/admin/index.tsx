import React from "react";
import Head from "next/head";

const AdminDashboard: React.FC = () => {
  return (
    <>
      <Head>
        <title>Dasbor Admin | AgriSmart</title>
      </Head>

      <main className="p-4 md:p-8 grow flex flex-col gap-8 w-full mx-auto">
        {/* Page Header */}
        <div className="mb-2">
          <h2 className="text-2xl md:text-[1.75rem] font-bold font-headline text-on-surface">
            Ringkasan Sistem
          </h2>
          <p className="text-sm md:text-base font-body text-on-surface-variant mt-1">
            Pantau performa perangkat dan aktivitas pengguna secara real-time.
          </p>
        </div>

        {/* Bento Grid Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Metric 1: Total Pengguna (Large/Wide) */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm border border-emerald-50 group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary-container opacity-5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-[0.75rem] font-bold text-outline uppercase tracking-wider font-body">
                  Total Pengguna
                </p>
                <h3 className="text-4xl md:text-[3.5rem] leading-none font-bold font-headline text-on-surface mt-2 tracking-tight">
                  124
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined icon-filled">
                  group
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[0.75rem] font-body text-primary relative z-10">
              <span className="material-symbols-outlined text-[1rem]">
                trending_up
              </span>
              <span className="font-bold">+12% bulan ini</span>
            </div>
          </div>

          {/* Metric 2: Pot Pintar Aktif */}
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                <span className="material-symbols-outlined text-[1.25rem]">
                  potted_plant
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[0.7rem] font-bold font-body">
                Sehat
              </span>
            </div>
            <div>
              <h3 className="text-3xl md:text-[2rem] leading-tight font-bold font-headline text-on-surface">
                89
              </h3>
              <p className="text-[0.75rem] font-bold text-on-surface-variant font-body mt-1">
                Pot Pintar Aktif
              </p>
            </div>
          </div>

          {/* Metric 3: Log Data */}
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[1.25rem]">
                  history
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl md:text-[2rem] leading-tight font-bold font-headline text-on-surface">
                12.4k
              </h3>
              <p className="text-[0.75rem] font-bold text-on-surface-variant font-body mt-1">
                Log Data Hari Ini
              </p>
              <p className="text-[0.65rem] text-outline font-body mt-2">
                Sync: 2 mnt lalu
              </p>
            </div>
          </div>

          {/* Metric 4: MQTT Status */}
          <div className="md:col-span-4 bg-gradient-to-r from-primary to-primary-container rounded-xl p-6 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-lg shadow-primary/20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
            <div className="flex items-center gap-4 md:gap-6 relative z-10 mb-4 md:mb-0 w-full md:w-auto">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[2rem]">
                  hub
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 font-body">
                  Status MQTT Broker
                </p>
                <h3 className="text-2xl font-bold font-headline mt-1 flex items-center gap-3">
                  Online
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]"></span>
                </h3>
              </div>
            </div>
            <div className="text-left md:text-right relative z-10 w-full md:w-auto">
              <p className="text-3xl font-light font-headline">99.98%</p>
              <p className="text-xs text-white/70 font-body mt-1">
                Uptime 30 hari terakhir
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections Below Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Section 1: Aktivitas Pengguna Terbaru */}
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 flex flex-col shadow-sm border border-emerald-50">
            <h3 className="text-[1.25rem] font-bold font-headline text-on-surface mb-6">
              Aktivitas Pengguna Terbaru
            </h3>
            <div className="flex-grow space-y-4">
              {/* Activity Item 1 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low transition-colors hover:bg-surface-container">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                  <span className="material-symbols-outlined text-[1rem]">
                    add_circle
                  </span>
                </div>
                <div className="flex-grow">
                  <p className="text-[0.875rem] font-bold font-body text-on-surface">
                    Budi Santoso mendaftarkan device baru
                  </p>
                  <p className="text-[0.75rem] font-body text-outline mt-1">
                    Greenhouse Alpha - Pot #42
                  </p>
                </div>
                <span className="text-[0.75rem] font-body text-outline whitespace-nowrap">
                  10 mnt lalu
                </span>
              </div>
              {/* Activity Item 2 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low transition-colors hover:bg-surface-container">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
                  <span className="material-symbols-outlined text-[1rem]">
                    settings
                  </span>
                </div>
                <div className="flex-grow">
                  <p className="text-[0.875rem] font-bold font-body text-on-surface">
                    Siti Rahma mengubah jadwal penyiraman
                  </p>
                  <p className="text-[0.75rem] font-body text-outline mt-1">
                    Greenhouse Beta - Semua Pot
                  </p>
                </div>
                <span className="text-[0.75rem] font-body text-outline whitespace-nowrap">
                  1 jam lalu
                </span>
              </div>
              {/* Activity Item 3 */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-red-50 transition-colors hover:bg-red-100/50">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700">
                  <span className="material-symbols-outlined text-[1rem]">
                    warning
                  </span>
                </div>
                <div className="flex-grow">
                  <p className="text-[0.875rem] font-bold font-body text-on-surface">
                    Peringatan sensor offline
                  </p>
                  <p className="text-[0.75rem] font-body text-outline mt-1">
                    Koneksi terputus pada Pot #18
                  </p>
                </div>
                <span className="text-[0.75rem] font-body text-outline whitespace-nowrap">
                  2 jam lalu
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Status Server & Jaringan */}
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 flex flex-col shadow-sm border border-emerald-50">
            <h3 className="text-[1.25rem] font-bold font-headline text-on-surface mb-6">
              Status Server & Jaringan
            </h3>
            <div className="flex-grow flex flex-col justify-center gap-8">
              {/* Status Bar 1 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[0.875rem] font-bold font-body text-on-surface">
                    Beban CPU Server
                  </p>
                  <p className="text-[0.75rem] font-black font-body text-primary">
                    34%
                  </p>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: "34%" }}
                  ></div>
                </div>
              </div>
              {/* Status Bar 2 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[0.875rem] font-bold font-body text-on-surface">
                    Penggunaan Memori
                  </p>
                  <p className="text-[0.75rem] font-black font-body text-emerald-600">
                    62%
                  </p>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: "62%" }}
                  ></div>
                </div>
              </div>
              {/* Status Bar 3 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[0.875rem] font-bold font-body text-on-surface">
                    Kapasitas Penyimpanan DB
                  </p>
                  <p className="text-[0.75rem] font-black font-body text-outline">
                    18%
                  </p>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-outline-variant rounded-full"
                    style={{ width: "18%" }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <span className="material-symbols-outlined">cloud_done</span>
                </div>
                <div>
                  <p className="text-[0.875rem] font-bold font-body text-emerald-900">
                    Sistem Stabil
                  </p>
                  <p className="text-[0.75rem] font-body text-emerald-700/80 mt-1">
                    Tidak ada anomali terdeteksi dalam 24 jam terakhir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
