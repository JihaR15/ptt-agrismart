import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  arrayRemove,
} from "firebase/firestore";

import AddDeviceModal from "../components/AddDeviceModal";
import EditDeviceModal from "../components/EditDeviceModal";

import { useAgriSmartGlobal } from "../context/AgriSmartContext";

interface Device {
  id: string;
  name: string;
  createdAt: string;
  imageUrl: string;
  targetMoisture: number;
}

const DeviceRow = ({
  device,
  index,
  onDelete,
  onEdit,
  onStatusChange,
}: {
  device: any;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (device: any) => void;
  onStatusChange: (id: string, isOffline: boolean) => void;
}) => {
  const globalContext = useAgriSmartGlobal();
  
  const isCurrentActive = globalContext.deviceId === device.id;
  const espStatus = isCurrentActive ? globalContext.espStatus : "Terputus";

  useEffect(() => {
    onStatusChange(device.id, espStatus === "Terputus");
  }, [espStatus, device.id, onStatusChange]);

  return (
    <tr
      className={`${index % 2 !== 0 ? "bg-surface-container-low/30" : ""} hover:bg-emerald-50/30 transition-colors group`}
    >
      <td className="px-8 py-5">
        <span className="font-mono text-sm font-semibold px-2 py-1 rounded text-emerald-700 bg-emerald-50">
          {device.id}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <img
            alt={device.name}
            className={`w-10 h-10 rounded-lg object-cover ${espStatus === "Terputus" ? "grayscale opacity-60" : ""}`}
            src={device.imageUrl}
          />
          <span
            className={`font-semibold ${espStatus === "Terhubung" ? "text-on-surface" : "text-neutral-500"}`}
          >
            {device.name}
          </span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold ${espStatus === "Terhubung" ? "text-emerald-800" : "text-neutral-400"}`}
          >
            {device.targetMoisture}%
          </span>
          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${espStatus === "Terhubung" ? "bg-emerald-500" : "bg-neutral-300"}`}
              style={{ width: `${device.targetMoisture}%` }}
            ></div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            espStatus === "Terhubung"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {espStatus === "Terhubung" && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
          {espStatus}
        </span>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(device)}
            className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
            title="Edit Perangkat"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            onClick={() => onDelete(device.id)}
            className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors"
            title="Hapus Perangkat"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

const Devices: React.FC = () => {
  const { data: session } = useSession();

  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<any | null>(null);
  const [offlineStatus, setOfflineStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedDevices = localStorage.getItem("agrismart_devices_cache");
      const cachedStatus = localStorage.getItem("agrismart_offline_status_cache");
      
      if (cachedDevices) {
        setDevices(JSON.parse(cachedDevices));
        setIsLoading(false);
      }
      if (cachedStatus) {
        setOfflineStatus(JSON.parse(cachedStatus));
      }
    }
  }, []);

  const fetchDevices = async () => {
    if (!session?.user?.email) return;

    if (devices.length === 0) {
      setIsLoading(true);
    }
    
    try {
      const q = query(
        collection(db, "devices"),
        where("ownerEmail", "==", session.user.email),
      );
      const querySnapshot = await getDocs(q);

      const fetchedDevices: Device[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedDevices.push({
          id: doc.id,
          name: data.name || "Pot Tanpa Nama",
          createdAt: data.createdAt || "",
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=150&auto=format&fit=crop",
          targetMoisture: data.targetMoisture !== undefined ? data.targetMoisture : 60,
        });
      });

      setDevices(fetchedDevices);
      localStorage.setItem("agrismart_devices_cache", JSON.stringify(fetchedDevices));
    } catch (error) {
      console.error("Gagal mengambil data perangkat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [session]);

  const handleDelete = async (deviceId: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus perangkat ${deviceId}?`,
    );
    if (!confirmDelete || !session?.user?.email) return;

    try {
      const batch = writeBatch(db);

      const deviceRef = doc(db, "devices", deviceId);
      batch.delete(deviceRef);

      const masterRef = doc(db, "master_devices", deviceId);
      batch.update(masterRef, { status: true });

      const userQuery = query(
        collection(db, "users"),
        where("email", "==", session.user.email),
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDocRef = doc(db, "users", userSnapshot.docs[0].id);
        batch.update(userDocRef, {
          allowedDevices: arrayRemove(deviceId),
        });
      }

      await batch.commit();
      alert("Perangkat berhasil dihapus dari akun Anda!");

      fetchDevices();
    } catch (error) {
      console.error("Gagal menghapus perangkat:", error);
      alert("Terjadi kesalahan saat menghapus perangkat.");
    }
  };

  const handleStatusChange = useCallback((id: string, isOffline: boolean) => {
    setOfflineStatus((prev) => {
      if (prev[id] === isOffline) return prev;
      const newStatus = { ...prev, [id]: isOffline };
      localStorage.setItem("agrismart_offline_status_cache", JSON.stringify(newStatus));
      return newStatus;
    });
  }, []);

  const totalOffline = devices.filter((device) => offlineStatus[device.id] === true).length;

  const totalMoisture = devices.reduce((sum, dev) => sum + (dev.targetMoisture || 0), 0);
  const avgMoisture = devices.length > 0 ? Math.round(totalMoisture / devices.length) : 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-headline font-extrabold text-emerald-900 tracking-tight">
            Kelola Ekosistem Digital
          </h3>
          <p className="text-neutral-600 mt-2 font-body">
            Pantau dan konfigurasikan setiap perangkat IoT di area perkebunan
            secara real-time.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Tambah Pot Baru
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-5xl mb-4">
            sync
          </span>
          <p className="text-emerald-800 font-medium animate-pulse">
            Memuat data perangkat...
          </p>
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-emerald-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-primary mb-6">
            <span className="material-symbols-outlined text-[4rem]">
              potted_plant
            </span>
          </div>
          <h4 className="text-2xl font-headline font-bold text-emerald-900 mb-2">
            Anda Belum Memiliki Perangkat
          </h4>
          <p className="text-on-surface-variant max-w-md mb-8">
            Hubungkan pot pintar AgriSmart Anda sekarang untuk mulai memantau
            dan merawat tanaman secara otomatis.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-container text-white font-bold rounded-full shadow-xl shadow-primary/20 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Klaim Perangkat Baru
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xl shadow-emerald-900/5 flex items-center gap-4 border border-white/50">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                <span className="material-symbols-outlined">potted_plant</span>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">
                  Total Perangkat
                </p>
                <p className="text-2xl font-headline font-bold text-emerald-900">
                  {devices.length} Unit
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xl shadow-emerald-900/5 flex items-center gap-4 border border-white/50">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                <span className="material-symbols-outlined">water_drop</span>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">
                  Kebutuhan Air Rata-rata
                </p>
                <p className="text-2xl font-headline font-bold text-emerald-900">
                  {avgMoisture}%
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xl shadow-emerald-900/5 flex items-center gap-4 border border-white/50">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                <span className="material-symbols-outlined">offline_bolt</span>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">
                  Perangkat Offline
                </p>
                <p
                  className={`text-2xl font-headline font-bold ${totalOffline > 0 ? "text-error" : "text-emerald-900"}`}
                >
                  {totalOffline} Unit
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-2xl shadow-emerald-900/5 overflow-hidden border border-emerald-50">
            <div className="px-8 py-6 border-b border-surface-container-low flex justify-between items-center bg-emerald-50/20">
              <h4 className="font-headline font-bold text-emerald-900">
                Daftar Perangkat Aktif
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      ID Pot
                    </th>
                    <th className="px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Nama Tanaman
                    </th>
                    <th className="px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Target Kelembapan
                    </th>
                    <th className="px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Status
                    </th>
                    <th className="px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {devices.map((device, index) => (
                    <DeviceRow
                      key={device.id}
                      device={device}
                      index={index}
                      onDelete={handleDelete}
                      onEdit={setDeviceToEdit}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isAddModalOpen && (
        <AddDeviceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchDevices} />
      )}

      {deviceToEdit && (
        <EditDeviceModal 
          isOpen={!!deviceToEdit} 
          onClose={() => setDeviceToEdit(null)} 
          onSuccess={fetchDevices} 
          device={deviceToEdit} 
        />
      )}
    </>
  );
};

export default Devices;