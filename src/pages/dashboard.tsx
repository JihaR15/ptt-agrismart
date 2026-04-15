import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAgriSmart } from "../hooks/useAgriSmart";
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

const Dashboard: React.FC = () => {
  // State untuk UI lokal (Slider)
  const [threshold, setThreshold] = useState<number>(45);

  // Mengambil state dan fungsi dari Firebase Hook
  const {
    espStatus,
    dhtStatus,
    sensorData,
    chartData,
    isWatering,
    handleWatering,
    isSensorActive,
    toggleSensorActive,
  } = useAgriSmart();

  return (
    <DashboardLayout pageTitle="Dasbor Utama">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="appearance-none bg-surface-container-lowest border border-emerald-100 rounded-xl px-4 py-2.5 pr-10 text-sm font-headline font-semibold text-emerald-900 focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer shadow-sm outline-none">
              <option value="p-001">Pot Tomat A1</option>
              <option value="p-002">Pot Cabai B2</option>
              <option value="p-003">Pot Selada C3</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none text-xl">
              keyboard_arrow_down
            </span>
          </div>
          
          {/* Indikator Status ESP Real-time */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${espStatus === 'Terhubung' ? 'bg-emerald-50 border-emerald-100/50' : 'bg-red-50 border-red-100/50'}`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${espStatus === 'Terhubung' ? 'bg-primary' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-bold uppercase tracking-wider ${espStatus === 'Terhubung' ? 'text-primary' : 'text-red-500'}`}>
              {espStatus}
            </span>
          </div>

          {/* Tombol Toggle Sensor dari Hook */}
          <button
            onClick={toggleSensorActive}
            disabled={espStatus !== "Terhubung"}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isSensorActive
                ? "bg-surface-container-lowest text-on-surface-variant border-emerald-100 hover:bg-surface-container-low"
                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            } ${espStatus !== "Terhubung" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* <span className="material-symbols-outlined text-sm">
              {isSensorActive ? "pause_circle" : "play_circle"}
            </span>
            {isSensorActive ? "Jeda Sensor" : "Lanjut Sensor"} */}
          </button>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <span className="material-symbols-outlined text-sm">sync</span>
          <span>Sinkronisasi terakhir: Baru saja</span>
        </div>
      </div>

      {/* 2. Baris Metrik Sensor (3 Kartu) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kartu Kelembapan Tanah (DUMMY) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
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
              68<span className="text-2xl text-on-surface-variant">%</span>
            </h3>
            <p className="text-sm font-body text-primary mt-2 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">
                trending_up
              </span>{" "}
              Optimal
            </p>
          </div>
        </div>

        {/* Kartu Suhu Lingkungan (REAL-TIME DHT) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
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
              {sensorData.temperature > 0 ? sensorData.temperature.toFixed(1) : "--"}<span className="text-2xl text-on-surface-variant">°C</span>
            </h3>
            <p className="text-sm font-body text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
               {dhtStatus === 'Terhubung' ? 'Stabil (Real-time)' : 'Sensor Terputus'}
            </p>
          </div>
        </div>

        {/* Kartu Level Tangki Air (DUMMY) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-primary-container rounded-r-md"></div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-on-surface-variant">
              Level Tangki Air
            </span>
            <span className="material-symbols-outlined text-primary-container">
              layers
            </span>
          </div>
          <div>
            <h3 className="text-5xl font-headline font-extrabold text-on-surface">
              82<span className="text-2xl text-on-surface-variant">%</span>
            </h3>
            <div className="w-full bg-surface-container-low h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-primary-container h-full"
                style={{ width: "82%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Kontrol Perangkat (Slider & Tombol Siram) */}
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
          {/* Slider Ambang Batas */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-on-surface-variant">
                Ambang Batas Kelembapan Otomatis
              </label>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
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
              />
            </div>
            <div className="flex justify-between text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">
              <span>Kering</span>
              <span>Lembap</span>
              <span>Basah</span>
            </div>
          </div>

          {/* Tombol Siram Manual (REAL-TIME) */}
          <div className="flex flex-col gap-4">
            <p className="text-sm text-on-surface-variant">
              Aktifkan penyiraman secara manual tanpa menunggu jadwal otomatis
              atau ambang batas.
            </p>
            <button
              onClick={handleWatering}
              disabled={isWatering || espStatus !== "Terhubung"}
              className={`w-full text-white py-4 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-3 shadow-lg transition-all ${
                isWatering || espStatus !== "Terhubung"
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-primary hover:bg-primary-container shadow-primary/20 active:scale-95 text-on-primary"
              }`}
            >
              <span className={`${isWatering ? "animate-spin" : ""} material-symbols-outlined`}>
                {isWatering ? "sync" : "water_drop"}
              </span>
              {isWatering ? "Menyiram..." : "Siram Tanaman Sekarang"}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Area Grafik Tren (REAL-TIME RECHARTS) */}
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
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                {/* <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#006947" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#3b82f6" /> */}
                {/* Sumbu Y Kiri (Suhu): Diatur manual dari 0 sampai 50 */}
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 12 }} 
                  stroke="#006947" 
                  domain={[0, 50]} 
                />
                {/* Sumbu Y Kanan (Kelembapan): Diatur manual dari 0 sampai 100 */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12 }} 
                  stroke="#3b82f6" 
                  domain={[0, 100]} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
    </DashboardLayout>
  );
};

export default Dashboard;