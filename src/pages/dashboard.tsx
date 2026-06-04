import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AddDeviceModal from "../components/AddDeviceModal";
import { useAgriSmart } from "../hooks/useAgriSmart";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  documentId,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DeviceDetail {
  id: string;
  name: string;
  targetMoisture: number;
}

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(45);

  const [devices, setDevices] = useState<DeviceDetail[]>([]);
  const [isDevicesLoading, setIsDevicesLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const q = query(
      collection(db, "users"),
      where("email", "==", session.user.email),
    );

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

            const devicesData = devicesSnapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name || doc.id,
              targetMoisture: doc.data().targetMoisture !== undefined ? doc.data().targetMoisture : 80,
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
    if (
      devices.length > 0 &&
      (!selectedDevice || !devices.find((d) => d.id === selectedDevice))
    ) {
      setSelectedDevice(devices[0].id);
    } else if (devices.length === 0) {
      setSelectedDevice("");
    }
  }, [devices, selectedDevice]);

  useEffect(() => {
    const activeDevice = devices.find((d) => d.id === selectedDevice);
    if (activeDevice) {
      setThreshold(activeDevice.targetMoisture);
    }
  }, [selectedDevice, devices]);

  const {
    espStatus,
    dhtStatus,
    sensorData,
    chartData,
    isWatering,
    handleWatering,
    isSensorActive,
    toggleSensorActive,
    updateThreshold,
    lastMessageTime,
  } = useAgriSmart(selectedDevice);

  const handleThresholdRelease = async () => {
    updateThreshold(threshold);

    if (selectedDevice) {
      try {
        const deviceRef = doc(db, "devices", selectedDevice);
        await updateDoc(deviceRef, {
          targetMoisture: threshold,
        });
        
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.id === selectedDevice
              ? { ...device, targetMoisture: threshold }
              : device
          )
        );
      } catch (error) {
        console.error("Gagal menyimpan threshold ke Firebase:", error);
      }
    }
  };

  const formatLastSyncTime = (timestamp: number) => {
    if (!timestamp) return "Menunggu data...";
    
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    // Jika data baru masuk kurang dari 10 detik yang lalu, tampilkan "Baru saja"
    if (diffInSeconds < 10) return "Baru saja";
    
    // Selebihnya tampilkan jam pastinya (Contoh: 14:30:45)
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (
    status === "loading" ||
    (status === "authenticated" && isDevicesLoading)
  ) {
    return (
      <div className="flex-1 flex items-center justify-center h-[80vh]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">
          sync
        </span>
      </div>
    );
  }

  return (
    <>
      {devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
          <div className="max-w-md w-full text-center flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-emerald-50/40 flex items-center justify-center mb-8 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
              <span
                className="material-symbols-outlined text-emerald-300 relative z-10"
                style={{ fontSize: "100px" }}
              >
                potted_plant
              </span>
            </div>

            <h3 className="font-headline text-2xl font-bold text-on-surface mb-3 tracking-tight">
              Belum Ada Pot Pintar
            </h3>
            <p className="font-body text-on-surface-variant mb-10 leading-relaxed px-4">
              Mulai pantau tanaman Anda dengan menambahkan perangkat AgriSmart
              pertama Anda.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-primary-container text-white rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Tambah Perangkat Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="appearance-none bg-surface-container-lowest border border-emerald-100 rounded-xl px-4 py-2.5 pr-10 text-sm font-headline font-semibold text-emerald-900 focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer shadow-sm outline-none transition-all duration-300 ease-in-out"
                >
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} {/* Menampilkan Nama Perangkat di UI */}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none text-xl">
                  keyboard_arrow_down
                </span>
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${espStatus === "Terhubung" ? "bg-emerald-50 border-emerald-100/50" : "bg-red-50 border-red-100/50"}`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${espStatus === "Terhubung" ? "bg-primary" : "bg-red-500"}`}
                ></div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${espStatus === "Terhubung" ? "text-primary" : "text-red-500"}`}
                >
                  {espStatus}
                </span>
              </div>

              <button
                onClick={toggleSensorActive}
                disabled={espStatus !== "Terhubung"}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isSensorActive
                    ? "bg-surface-container-lowest text-on-surface-variant border-emerald-100 hover:bg-surface-container-low"
                    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                } ${espStatus !== "Terhubung" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSensorActive ? "pause" : "play_arrow"}
                </span>
                {isSensorActive ? "Jeda Sensor" : "Lanjut Pantau"}
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>Sinkronisasi terakhir: {formatLastSyncTime(lastMessageTime)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-primary rounded-r-md"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-on-surface-variant">
                  Kelembapan Tanah
                </span>
                <span className="material-symbols-outlined text-primary">
                  water_drop
                </span>
              </div>
              <div>
                <h3 className="text-5xl font-headline font-extrabold text-on-surface">
                  {sensorData.soilMoisture ?? "--"}
                  <span className="text-2xl text-on-surface-variant">%</span>
                </h3>
                <p className="text-sm font-body text-primary mt-2 flex items-center gap-1 font-medium">
                  {sensorData.soilMoisture ? "Real-time" : "Menunggu data..."}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-tertiary rounded-r-md"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-on-surface-variant">
                  Suhu Lingkungan
                </span>
                <span className="material-symbols-outlined text-tertiary">
                  thermostat
                </span>
              </div>
              <div>
                <h3 className="text-5xl font-headline font-extrabold text-on-surface">
                  {sensorData.temperature > 0
                    ? sensorData.temperature.toFixed(1)
                    : "--"}
                  <span className="text-2xl text-on-surface-variant">°C</span>
                </h3>
                <p className="text-sm font-body text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
                  {dhtStatus === "Terhubung"
                    ? "Stabil (Real-time)"
                    : "Sensor Terputus"}
                </p>
              </div>
            </div>

            <div
              className={`p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border shadow-sm transition-transform duration-300 hover:-translate-y-1 ${
                sensorData.waterLevel <= 10
                  ? "bg-red-50 border-red-200"
                  : "bg-surface-container-lowest border-emerald-50"
              }`}
            >
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] rounded-r-md ${
                  sensorData.waterLevel <= 10
                    ? "bg-red-500"
                    : "bg-primary-container"
                }`}
              ></div>

              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-semibold ${
                    sensorData.waterLevel <= 10
                      ? "text-red-700"
                      : "text-on-surface-variant"
                  }`}
                >
                  Level Tangki Air
                </span>
                <span
                  className={`material-symbols-outlined ${
                    sensorData.waterLevel <= 10
                      ? "text-red-500 animate-pulse"
                      : "text-primary-container"
                  }`}
                >
                  {sensorData.waterLevel <= 10 ? "warning" : "layers"}
                </span>
              </div>

              <div>
                <h3
                  className={`text-5xl font-headline font-extrabold ${
                    sensorData.waterLevel <= 10
                      ? "text-red-600"
                      : "text-on-surface"
                  }`}
                >
                  {sensorData.waterLevel}
                  <span
                    className={`text-2xl ${
                      sensorData.waterLevel <= 10
                        ? "text-red-400"
                        : "text-on-surface-variant"
                    }`}
                  >
                    %
                  </span>
                </h3>

                {sensorData.waterLevel <= 10 ? (
                  <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1 animate-pulse">
                    Tandon Kosong! Pompa Dimatikan.
                  </p>
                ) : (
                  <div className="w-full bg-surface-container-low h-2 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-primary-container h-full transition-all duration-500 ease-out"
                      style={{ width: `${sensorData.waterLevel}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KONTROL PERANGKAT */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-emerald-50 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">
                settings_input_component
              </span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                Kontrol Perangkat
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-on-surface-variant">
                    Ambang Batas Kelembapan Otomatis
                  </label>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold transition-all duration-300">
                    {threshold}%
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-2 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary"
                    max="100"
                    min="0"
                    type="range"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    onMouseUp={handleThresholdRelease} // Kirim saat mouse dilepas
                    onTouchEnd={handleThresholdRelease} // Kirim saat layar sentuh dilepas
                    disabled={espStatus !== "Terhubung"}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">
                  <span>Kering</span>
                  <span>Lembap</span>
                  <span>Basah</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant">
                  Aktifkan penyiraman secara manual tanpa menunggu jadwal
                  otomatis.
                </p>
                <button
                  onClick={handleWatering}
                  disabled={isWatering || espStatus !== "Terhubung"}
                  className={`w-full text-white py-4 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-3 shadow-lg transition-all duration-300 ${
                    isWatering || espStatus !== "Terhubung"
                      ? "bg-gray-400 cursor-not-allowed shadow-none"
                      : "bg-linear-to-r from-primary to-primary-container hover:shadow-primary/40 active:scale-95 text-on-primary"
                  }`}
                >
                  <span
                    className={`${isWatering ? "animate-spin" : ""} material-symbols-outlined`}
                  >
                    {isWatering ? "sync" : "water_drop"}
                  </span>
                  {isWatering ? "Menyiram..." : "Siram Tanaman Sekarang"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 border border-emerald-50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface">
                  Grafik Tren 24 Jam
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Statistik real-time sensor IoT (Suhu & Kelembapan Udara)
                </p>
              </div>
            </div>
            <div className="w-full h-80 relative">
              {chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-container-low rounded-xl">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-primary/40 mb-2 animate-spin">
                      sync
                    </span>
                    <p className="text-on-surface-variant font-medium">
                      Menunggu Data Sensor...
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      stroke="#006947"
                      domain={[0, 50]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      stroke="#3b82f6"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="suhu"
                      name="Suhu (°C)"
                      stroke="#006947"
                      fill="#006947"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="kelembapan"
                      name="Kelembapan Udara (%)"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}

      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async () => {
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

export default Dashboard;
