import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

// Interface data device
interface MasterDevice {
  id: string;
  status: boolean;
  batch: string;
  claimedBy: string | null;
}

const MasterDevices: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputDeviceID, setInputDeviceID] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State data device
  const [devices, setDevices] = useState<MasterDevice[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Ambil data realtime dari Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "master_devices"),
      async (snapshot) => {
        const promises = snapshot.docs.map(async (document) => {
          const data = document.data();

          const deviceData: MasterDevice = {
            id: document.id,
            status: data.status,
            batch: data.batch || "Batch Default",
            claimedBy: null,
          };

          // Ambil owner jika device sudah diklaim
          if (data.status === false) {
            const claimedDocRef = doc(db, "devices", document.id);
            const claimedDocSnap = await getDoc(claimedDocRef);

            if (claimedDocSnap.exists()) {
              deviceData.claimedBy = claimedDocSnap.data().ownerEmail;
            } else {
              deviceData.claimedBy = "User tidak diketahui";
            }
          }

          return deviceData;
        });

        const resolvedDevices = await Promise.all(promises);

        setDevices(resolvedDevices);
        setIsFetching(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Simpan device baru
  const handleSaveDevice = async () => {
    const formattedID = inputDeviceID.trim();

    if (!formattedID) return;

    setIsLoading(true);

    try {
      const deviceRef = doc(db, "master_devices", formattedID);
      const checkDoc = await getDoc(deviceRef);

      // Cek apakah device sudah ada
      if (checkDoc.exists()) {
        alert("Gagal: Device ID sudah terdaftar!");
        setIsLoading(false);
        return;
      }

      // Simpan ke Firestore
      await setDoc(deviceRef, {
        batch: "Batch Baru",
        status: true,
      });

      alert(`Device ${formattedID} berhasil ditambahkan!`);

      closeModal();
    } catch (error) {
      console.error("Error saving device:", error);
      alert("Terjadi kesalahan saat menyimpan device.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hapus device
  const handleDeleteDevice = async (id: string, status: boolean) => {
    if (!status) return;

    if (confirm(`Yakin ingin menghapus device ${id}?`)) {
      try {
        await deleteDoc(doc(db, "master_devices", id));
      } catch (error) {
        console.error("Error deleting device:", error);
        alert("Gagal menghapus device.");
      }
    }
  };

  // Copy ID device
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Kode ${text} berhasil disalin!`);
  };

  // Tutup modal
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
        {/* Header */}
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

        {/* Banner */}
        <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4">
          <span className="material-symbols-outlined text-emerald-700 mt-0.5">
            info
          </span>

          <p className="text-emerald-800 text-sm font-medium font-body leading-relaxed">
            Hanya device yang terdaftar di sini yang dapat diklaim pengguna.
          </p>
        </div>

        {/* Loading */}
        {isFetching ? (
          <div className="flex justify-center items-center py-20 text-emerald-600">
            <span className="material-symbols-outlined animate-spin text-4xl">
              sync
            </span>

            <span className="ml-3 font-semibold">Memuat Data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card device */}
            {devices.map((device) => (
              <div
                key={device.id}
                className={`bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all
                  ${
                    device.status
                      ? "border-2 border-dashed border-emerald-200 hover:shadow-md"
                      : "border-2 border-dashed border-emerald-100 opacity-90"
                  }
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
                          ${
                            device.status
                              ? "text-emerald-800"
                              : "text-emerald-900/40 line-through"
                          }
                        `}
                      >
                        {device.id}
                      </code>

                      {/* Copy button */}
                      <button
                        onClick={() => {
                          if (device.status) copyToClipboard(device.id);
                        }}
                        className={`p-1 rounded-lg transition-colors shrink-0
                          ${
                            device.status
                              ? "hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                              : "text-outline cursor-not-allowed"
                          }
                        `}
                        title="Copy Code"
                      >
                        <span className="material-symbols-outlined text-sm">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteDevice(device.id, device.status)}
                    className={`p-2 rounded-xl transition-colors shrink-0
                      ${
                        device.status
                          ? "text-error hover:bg-error-container/20 cursor-pointer"
                          : "text-outline cursor-not-allowed"
                      }
                    `}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        !device.status && "opacity-30"
                      }`}
                    >
                      delete
                    </span>
                  </button>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  {device.status ? (
                    <span className="px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-body">
                      Tersedia
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold tracking-wider flex items-center gap-1.5 font-body max-w-[70%]">
                      <span className="material-symbols-outlined text-[14px] shrink-0">
                        lock
                      </span>

                      <span className="truncate">{device.claimedBy}</span>
                    </span>
                  )}

                  <span className="text-[10px] text-outline font-bold bg-neutral-100 px-2 py-1 rounded-md font-body shrink-0">
                    {device.batch}
                  </span>
                </div>
              </div>
            ))}

            {/* Card tambah device */}
            <div
              className="bg-emerald-50/30 rounded-2xl p-6 border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center text-center gap-3 hover:bg-emerald-50/50 transition-colors cursor-pointer group min-h-[160px]"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>

              <div>
                <p className="text-emerald-700 font-bold text-sm font-headline">
                  Daftarkan Unit Baru
                </p>

                <p className="text-[11px] text-emerald-600/70 max-w-[180px] font-body mt-1">
                  Tambahkan ID ESP32 baru
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal tambah device */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-emerald-50 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl icon-filled">
                  memory
                </span>
              </div>

              <button
                onClick={closeModal}
                className="p-2 hover:bg-red-50 text-outline hover:text-red-500 transition-colors rounded-xl"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 mb-8">
              <h3 className="text-2xl font-black font-headline text-emerald-900">
                Input ID Perangkat
              </h3>

              <p className="text-sm text-on-surface-variant font-body">
                Masukkan ID unik perangkat ESP32.
              </p>
            </div>

            {/* Input dengan penambahan onKeyDown */}
            <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-6 mb-8 text-center">
              <label
                htmlFor="deviceID"
                className="text-[10px] font-black text-emerald-700/50 uppercase tracking-[0.2em] block mb-3 text-left pl-2"
              >
                Device ID
              </label>

              <input
                id="deviceID"
                type="text"
                autoFocus
                value={inputDeviceID}
                onChange={(e) => setInputDeviceID(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && inputDeviceID.trim()) {
                    handleSaveDevice();
                  }
                }}
                placeholder="ESP_AGRI_03"
                className="w-full bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-mono font-black text-primary tracking-widest text-center placeholder:text-emerald-700/20 outline-none"
                autoComplete="off"
              />
            </div>

            {/* Action button */}
            <div className="flex flex-col gap-3">
              <button
                disabled={isLoading || !inputDeviceID.trim()}
                onClick={handleSaveDevice}
                className="w-full bg-primary hover:bg-primary-container disabled:bg-emerald-200 disabled:text-emerald-50/50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      sync
                    </span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Simpan
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
