import React, { useState } from "react";
import Head from "next/head";

const MasterDevices: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputDeviceID, setInputDeviceID] = useState(""); // Mengganti generatedCode
  const [isLoading, setIsLoading] = useState(false);

  // Data statis sementara
  const [devices] = useState([
    { id: "AGRI-POT-XYZ123", status: "available", claimedBy: null, generatedAt: "24 Okt 2026" },
    { id: "AGRI-POT-GHJ789", status: "claimed", claimedBy: "@budi_santoso", generatedAt: "22 Okt 2026" },
    // ... data lainnya
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Kode ${text} berhasil disalin!`);
  };

  const handleSaveDevice = () => {
    // Validasi sederhana
    if (!inputDeviceID.trim()) return;

    setIsLoading(true);
    // Simulasi loading simpan ke Firestore
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(false);
      alert(`Perangkat dengan ID ${inputDeviceID} berhasil didaftarkan ke sistem!`);
      setInputDeviceID(""); // Reset input setelah berhasil
    }, 1500);
  };

  // Fungsi untuk menutup modal dan mereset input
  const closeModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
    setInputDeviceID("");
  };

  return (
    <>
      <Head>
        <title>Master Perangkat IoT | AgriSmart</title>
      </Head>

      <main className="p-4 md:p-8 flex-grow flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-headline text-emerald-900 tracking-tight">
              Master Data Perangkat IoT
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant mt-1 font-body">
              Kelola dan daftarkan kode aktivasi unit AgriSmart.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-full md:w-auto gap-2 bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Daftarkan Unit Baru</span>
          </button>
        </div>

        {/* Info Banner & Device Grid */}
        <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4">
          <span className="material-symbols-outlined text-emerald-700 mt-0.5">info</span>
          <p className="text-emerald-800 text-sm font-medium font-body leading-relaxed">
            Daftarkan Device ID yang telah di-hardcode pada ESP32 di bawah ini. Hanya kode yang terdaftar di sini yang bisa diklaim oleh pengguna melalui Dasbor mereka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all
                ${device.status === "available" ? "border-2 border-dashed border-emerald-200 hover:shadow-md" : "border-2 border-dashed border-emerald-100 opacity-90"}
              `}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1 overflow-hidden w-full">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-outline font-body">
                    Unique Device Code
                  </span>
                  <div className="flex items-center gap-2">
                    <code
                      className={`text-lg font-mono font-bold truncate
                        ${device.status === "available" ? "text-emerald-800" : "text-emerald-900/40 line-through"}
                      `}
                    >
                      {device.id}
                    </code>
                    <button
                      onClick={() => { if (device.status === "available") copyToClipboard(device.id); }}
                      className={`p-1 rounded-lg transition-colors shrink-0
                        ${device.status === "available" ? "hover:bg-emerald-50 text-emerald-600 cursor-pointer" : "text-outline cursor-not-allowed"}
                      `}
                      title="Copy Code"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>
                </div>

                <button
                  className={`p-2 rounded-xl transition-colors shrink-0
                    ${device.status === "available" ? "text-error hover:bg-error-container/20" : "text-outline cursor-not-allowed"}
                  `}
                  title={device.status === "available" ? "Hapus Kode" : "Tidak bisa menghapus perangkat aktif"}
                >
                  <span className={`material-symbols-outlined ${device.status !== "available" && "opacity-30"}`}>
                    delete
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                {device.status === "available" ? (
                  <span className="px-3 py-1 rounded-full border border-outline text-[11px] font-bold text-outline uppercase tracking-wider font-body">
                    Tersedia
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 font-body max-w-[70%] truncate">
                    <span className="material-symbols-outlined text-sm icon-filled shrink-0">check_circle</span>
                    Terklaim {device.claimedBy}
                  </span>
                )}
                <span className="text-[10px] text-outline font-body shrink-0">
                  Gen: {device.generatedAt}
                </span>
              </div>
            </div>
          ))}

          {/* Tombol Tambah Unit di Grid */}
          <div
            className="bg-emerald-50/30 rounded-2xl p-6 border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center text-center gap-3 hover:bg-emerald-50/50 transition-colors cursor-pointer group min-h-[160px]"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <div>
              <p className="text-emerald-700 font-bold text-sm font-headline">Daftarkan Unit Baru</p>
              <p className="text-[11px] text-emerald-600/70 max-w-[180px] font-body mt-1">
                Masukkan ID fisik ESP32 ke dalam sistem
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL INPUT DEVICE ID MANUAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-emerald-50 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl icon-filled">memory</span>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-red-50 text-outline hover:text-red-500 transition-colors rounded-xl"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 mb-8">
              <h3 className="text-2xl font-black font-headline text-emerald-900">Input ID Perangkat</h3>
              <p className="text-sm text-on-surface-variant font-body">
                Masukkan identitas unik (Device ID) yang telah diprogram secara hardcode pada fisik ESP32.
              </p>
            </div>

            {/* Kolom Input Manual */}
            <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-6 mb-8 text-center transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <label htmlFor="deviceID" className="text-[10px] font-black text-emerald-700/50 uppercase tracking-[0.2em] block mb-3 text-left pl-2">
                Device ID Fisik
              </label>
              <input
                id="deviceID"
                type="text"
                autoFocus
                value={inputDeviceID}
                onChange={(e) => setInputDeviceID(e.target.value.toUpperCase())}
                placeholder="Cth: AGRI-POT-A1"
                className="w-full bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-mono font-black text-primary tracking-widest text-center placeholder:text-emerald-700/20"
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={isLoading || !inputDeviceID.trim()}
                onClick={handleSaveDevice}
                className="w-full bg-primary hover:bg-primary-container disabled:bg-emerald-200 disabled:text-emerald-50/50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Simpan ke Master Data
                  </>
                )}
              </button>
              <button
                disabled={isLoading}
                onClick={closeModal}
                className="w-full bg-transparent text-outline font-bold py-3 hover:text-on-surface transition-colors"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MasterDevices;