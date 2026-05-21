import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Sesuaikan path

interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  device: any; // Data device yang sedang diedit
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({ isOpen, onClose, onSuccess, device }) => {
  const [deviceName, setDeviceName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetMoisture, setTargetMoisture] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Isi form dengan data awal saat modal dibuka
  useEffect(() => {
    if (device) {
      setDeviceName(device.name || "");
      setImageUrl(device.imageUrl || "");
      setTargetMoisture(device.targetMoisture || 60);
    }
  }, [device]);

  const handleUpdate = async () => {
    if (!deviceName.trim()) {
      setError("Nama Perangkat wajib diisi.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const deviceRef = doc(db, "devices", device.id);
      
      // Update dokumen di Firestore
      await updateDoc(deviceRef, {
        name: deviceName,
        imageUrl: imageUrl,
        targetMoisture: targetMoisture,
      });

      onSuccess(); // Refresh tabel
      onClose();   // Tutup modal
    } catch (err: any) {
      setError("Gagal memperbarui perangkat: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && device && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-sm bg-emerald-950/40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-50"
          >
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="font-headline text-2xl font-bold text-emerald-900">
                  Edit Perangkat
                </h2>
                <p className="text-sm text-on-surface-variant font-body">
                  Sesuaikan konfigurasi <span className="font-mono font-bold text-emerald-700">{device.id}</span>
                </p>
              </div>
              <button onClick={onClose} className="p-2 text-outline hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-600 text-sm rounded-xl font-body font-medium">
                  {error}
                </div>
              )}

              {/* Field: Nama Perangkat */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-emerald-900 ml-1">Nama Perangkat</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-700/50">label</span>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary font-body text-on-surface transition-all"
                  />
                </div>
              </div>

              {/* Field: Foto URL */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-emerald-900 ml-1">URL Foto (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-700/50">image</span>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary font-body text-on-surface transition-all text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Field: Target Kelembapan (Slider) */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-sm font-bold text-emerald-900">Batas Kelembapan (Target)</label>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-sm">
                    {targetMoisture}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetMoisture}
                  onChange={(e) => setTargetMoisture(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[11px] text-on-surface-variant font-body">
                  Pompa air otomatis akan menyala jika kelembapan tanah turun di bawah angka ini.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 text-outline font-bold rounded-2xl hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="flex-1 flex justify-center items-center gap-2 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <span className="material-symbols-outlined animate-spin">sync</span> : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditDeviceModal;