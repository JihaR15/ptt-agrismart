import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: session, update } = useSession();
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

const handleSave = async () => {
    if (!deviceId.trim() || !deviceName.trim()) {
      setError("Device ID dan Nama Perangkat wajib diisi.");
      return;
    }

    if (!session?.user?.email) {
      setError("Sesi pengguna tidak valid.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const masterRef = doc(db, "master_devices", deviceId);
      const masterSnap = await getDoc(masterRef);

      // Validasi Master Device
      if (!masterSnap.exists()) {
        setError("Device ID tidak valid atau tidak dikenali oleh sistem pusat.");
        setIsLoading(false);
        return;
      }
      
      // Validasi apakah sudah diklaim orang lain
      if (masterSnap.data().status === false) {
         setError("Perangkat ini sudah diklaim oleh pengguna lain.");
         setIsLoading(false);
         return;
      }

      const deviceRef = doc(db, "devices", deviceId);
      const deviceSnap = await getDoc(deviceRef);

      // Validasi Duplikasi
      if (deviceSnap.exists()) {
        setError("Perangkat ini sudah didaftarkan. Harap gunakan ID lain.");
        setIsLoading(false);
        return;
      }

      const q = query(
        collection(db, "users"),
        where("email", "==", session.user.email),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Data user tidak ditemukan di database.");
        setIsLoading(false);
        return;
      }

      const userId = querySnapshot.docs[0].id;
      const userRef = doc(db, "users", userId);

      const batch = writeBatch(db);

      // Masukkan ID ke array allowedDevices milik User
      batch.update(userRef, {
        allowedDevices: arrayUnion(deviceId),
      });

      // Ubah status Master Device menjadi false (Terklaim)
      batch.update(masterRef, {
        status: false
      });

      // Simpan metadata perangkat ke koleksi 'devices'
      batch.set(deviceRef, {
        name: deviceName,
        ownerEmail: session.user.email,
        createdAt: new Date().toISOString(),
        targetMoisture: 60, // Default awal 60%
        imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=150&auto=format&fit=crop" // Gambar default
      });

      // Eksekusi semua secara bersamaan
      await batch.commit();

      setDeviceId("");
      setDeviceName("");
      onSuccess();
    } catch (err: any) {
      setError("Gagal menambahkan perangkat: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-sm bg-on-surface/30"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-surface-container-lowest rounded-4xl shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  Tambah Perangkat Baru
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Konfigurasi sensor pintar untuk pemantauan presisi.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-outline hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content (Form) */}
            <div className="p-8 space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-500 text-sm rounded-xl">
                  {error}
                </div>
              )}

              {/* Field: Device ID */}
              <div className="space-y-2">
                <label className="block font-label text-sm font-semibold text-on-surface-variant ml-1">
                  Device ID
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                    qr_code_scanner
                  </span>
                  <input
                    type="text"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/50 font-body text-on-surface placeholder:text-outline transition-all"
                    placeholder="Contoh: ESP32-AGRI-01"
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant ml-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    info
                  </span>
                  Masukkan kode unik yang akan Anda program ke ESP32.
                </p>
              </div>

              {/* Field: Nama Perangkat */}
              <div className="space-y-2">
                <label className="block font-label text-sm font-semibold text-on-surface-variant ml-1">
                  Nama Perangkat
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                    label
                  </span>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/50 font-body text-on-surface placeholder:text-outline transition-all"
                    placeholder="Contoh: Pot Tomat Balkon"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 border-2 border-outline-variant text-on-surface-variant font-bold rounded-2xl hover:bg-surface-container-low transition-colors active:scale-95 duration-150 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 flex justify-center items-center gap-2 py-4 bg-linear-to-br from-primary to-primary-container text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 duration-150 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin">
                      sync
                    </span>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </div>

            {/* Footer Decorative Element */}
            <div className="h-2 bg-linear-to-r from-primary via-primary-container to-emerald-300"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddDeviceModal;
