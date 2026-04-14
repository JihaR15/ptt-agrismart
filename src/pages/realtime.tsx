import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import mqtt from "mqtt";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard: React.FC = () => {
  // 1. State Management
  const [espStatus, setEspStatus] = useState("Menghubungkan...");
  const [dhtStatus, setDhtStatus] = useState("Menunggu Data...");
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isWatering, setIsWatering] = useState(false);

  // Data Dummy sesuai permintaan
  const DUMMY_SOIL_MOISTURE = 68;
  const DUMMY_WATER_TANK = 82;

  // 2. Efek MQTT Client-Side (WebSockets)
  useEffect(() => {
    const client = mqtt.connect("wss://broker.emqx.io:8084/mqtt", {
      clientId: `nextjs_client_${Math.random().toString(16).slice(3)}`,
    });

    client.on("connect", () => {
      setEspStatus("Terhubung");
      client.subscribe("agrismart/iot/dht");
    });

    client.on("message", (topic, message) => {
      if (topic === "agrismart/iot/dht") {
        try {
          const data = JSON.parse(message.toString());
          setSensorData({
            temperature: data.temperature,
            humidity: data.humidity, // Kelembapan udara dari DHT
          });
          setDhtStatus("Terhubung");

          // Update data grafik
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

          setChartData((prev) => {
            const newData = [
              ...prev,
              { time: timeStr, suhu: data.temperature, kelembapan: data.humidity },
            ];
            // Simpan maksimal 15 titik data terakhir agar grafik tidak menumpuk
            if (newData.length > 15) newData.shift();
            return newData;
          });
        } catch (error) {
          console.error("Error parsing MQTT data", error);
        }
      }
    });

    client.on("offline", () => {
      setEspStatus("Terputus");
      setDhtStatus("Terputus");
    });

    return () => {
      client.end();
    };
  }, []);

  // 3. Fungsi Panggil API Penyiraman
  const handleWatering = async () => {
    setIsWatering(true);
    try {
      await fetch("/api/water", { method: "POST" });
    } catch (error) {
      console.error("Gagal mengirim perintah", error);
    }
    // Kembalikan status tombol setelah 3 detik (sesuai durasi ESP menyala)
    setTimeout(() => setIsWatering(false), 3000);
  };

  return (
    <DashboardLayout pageTitle="Dasbor Utama">
      {/* Header Status & Aksi Manual */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${espStatus === 'Terhubung' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            Status ESP32: {espStatus}
          </span>
        </div>
        <button
          onClick={handleWatering}
          disabled={isWatering || espStatus !== "Terhubung"}
          className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
            isWatering
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {isWatering ? "Menyiram..." : "Siram Manual"}
        </button>
      </div>

      {/* 1. Baris Metrik Sensor (3 Kartu) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kartu Kelembapan Tanah (DUMMY) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-primary rounded-r-md"></div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-on-surface-variant flex flex-col">
              Kelembapan Tanah
              <span className="text-[10px] text-red-400 font-normal mt-1">*Sensor Tidak Terhubung</span>
            </span>
            <span className="material-symbols-outlined text-primary">
              water_drop
            </span>
          </div>
          <div>
            <h3 className="text-5xl font-headline font-extrabold text-on-surface opacity-50">
              {DUMMY_SOIL_MOISTURE}<span className="text-2xl text-on-surface-variant">%</span>
            </h3>
            <p className="text-sm font-body text-primary mt-2 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">
                trending_up
              </span>{" "}
              Data Dummy
            </p>
          </div>
        </div>

        {/* Kartu Suhu Lingkungan (REALTIME DHT) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-tertiary rounded-r-md"></div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-on-surface-variant flex flex-col">
              Suhu Lingkungan
              <span className={`text-[10px] mt-1 font-normal ${dhtStatus === 'Terhubung' ? 'text-emerald-500' : 'text-orange-400'}`}>
                *{dhtStatus}
              </span>
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
              Real-time DHT
            </p>
          </div>
        </div>

        {/* Kartu Level Tangki Air (DUMMY) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-primary-container rounded-r-md"></div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-on-surface-variant flex flex-col">
              Level Tangki Air
              <span className="text-[10px] text-red-400 font-normal mt-1">*Sensor Tidak Terhubung</span>
            </span>
            <span className="material-symbols-outlined text-primary-container">
              layers
            </span>
          </div>
          <div>
            <h3 className="text-5xl font-headline font-extrabold text-on-surface opacity-50">
              {DUMMY_WATER_TANK}<span className="text-2xl text-on-surface-variant">%</span>
            </h3>
            <div className="w-full bg-surface-container-low h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-primary-container h-full transition-all duration-500"
                style={{ width: `${DUMMY_WATER_TANK}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Area Grafik Tren */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-emerald-50 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Grafik Tren Real-time
            </h2>
            <p className="text-sm text-on-surface-variant">
              Statistik suhu dan kelembapan udara (DHT)
            </p>
          </div>
        </div>

        {/* Grafik Recharts menggantikan SVG Placeholder */}
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
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#006947" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#3b82f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="suhu"
                  name="Suhu (°C)"
                  stroke="#006947"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="kelembapan"
                  name="Kelembapan Udara (%)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;