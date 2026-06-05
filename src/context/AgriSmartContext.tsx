import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import mqtt from "mqtt";

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterLevel: number;
}

interface ChartDataPoint {
  time: string;
  suhu: number;
  kelembapan: number;
}

interface AgriSmartContextType {
  deviceId: string;
  setDeviceId: (id: string) => void;
  espStatus: "Terhubung" | "Terputus";
  dhtStatus: "Terhubung" | "Terputus";
  sensorData: SensorData;
  chartData: ChartDataPoint[];
  isWatering: boolean;
  handleWatering: () => void;
  isSensorActive: boolean;
  toggleSensorActive: () => void;
  updateThreshold: (newThreshold: number) => void;
  lastMessageTime: number;
}

const AgriSmartContext = createContext<AgriSmartContextType | undefined>(undefined);

export const AgriSmartProvider = ({ children }: { children: ReactNode }) => {
  const [deviceId, setDeviceId] = useState<string>("");
  const [espStatus, setEspStatus] = useState<"Terhubung" | "Terputus">("Terputus");
  const [dhtStatus, setDhtStatus] = useState<"Terhubung" | "Terputus">("Terputus");
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [isSensorActive, setIsSensorActive] = useState<boolean>(true);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    waterLevel: 0,
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);

  // Ambil data dari localStorage saat deviceId berubah agar data langsung muncul tanpa delay
  useEffect(() => {
    if (typeof window !== "undefined" && deviceId) {
      // Muat cache data grafik
      const savedChartCache = localStorage.getItem(`agrismart_chart_${deviceId}`);
      if (savedChartCache) {
        setChartData(JSON.parse(savedChartCache));
      } else {
        setChartData([]);
      }

      // Muat cache data sensor real-time terakhir
      const savedSensorCache = localStorage.getItem(`agrismart_sensor_${deviceId}`);
      if (savedSensorCache) {
        setSensorData(JSON.parse(savedSensorCache));
      } else {
        setSensorData({ temperature: 0, humidity: 0, soilMoisture: 0, waterLevel: 0 });
      }
    }
  }, [deviceId]);

  // Logika Koneksi MQTT yang berjalan di background level aplikasi
  useEffect(() => {
    if (!deviceId) return;

    const mqttClient = mqtt.connect("wss://agrismart-mqtt.duckdns.org:8084", {
      protocol: "wss",
      port: 8084,
      reconnectPeriod: 5000,
    });

    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log(`✅ Berhasil terhubung ke MQTT Broker untuk Perangkat: ${deviceId}`);
      mqttClient.subscribe(`agrismart/${deviceId}/sensor`);
      mqttClient.subscribe(`agrismart/${deviceId}/status`);
    });

    mqttClient.on("message", (topic, message) => {
      console.log("DATA MASUK (GLOBAL):", topic, message.toString());
      setLastMessageTime(Date.now());

      try {
        const payload = JSON.parse(message.toString());

        if (topic === `agrismart/${deviceId}/sensor`) {
          setDhtStatus("Terhubung");

          const updatedSensor = {
            temperature: payload.temperature || 0,
            humidity: payload.humidity || 0,
            soilMoisture: payload.moisture || 0,
            waterLevel: payload.waterLevel || 0,
          };

          setSensorData(updatedSensor);
          // Simpan data sensor terakhir ke localStorage
          localStorage.setItem(`agrismart_sensor_${deviceId}`, JSON.stringify(updatedSensor));

          setChartData((prev) => {
            const timeString = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const newDataPoint = {
              time: timeString,
              suhu: payload.temperature || 0,
              kelembapan: payload.humidity || 0,
            };

            const updatedChart = [...prev, newDataPoint];
            const standardChart = updatedChart.length > 15 
              ? updatedChart.slice(updatedChart.length - 15) 
              : updatedChart;

            localStorage.setItem(`agrismart_chart_${deviceId}`, JSON.stringify(standardChart));
            return standardChart;
          });
        }

        if (topic === `agrismart/${deviceId}/status`) {
          if (payload.action === "WATERING_DONE") {
            setIsWatering(false);
          }
        }
      } catch (error) {
        console.error("Gagal mem-parsing payload MQTT:", error);
      }
    });

    mqttClient.on("offline", () => {
      setEspStatus("Terputus");
      setDhtStatus("Terputus");
    });

    return () => {
      console.log(`🔌 Memutus koneksi MQTT lama untuk perangkat: ${deviceId}`);
      mqttClient.end();
    };
  }, [deviceId]);

  // Interval pengecekan heartbeat status ESP32 (setiap 3 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastMessageTime) return;

      const diff = Date.now() - lastMessageTime;

      if (diff > 10000) {
        setEspStatus("Terputus");
        setDhtStatus("Terputus");
      } else {
        setEspStatus("Terhubung");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastMessageTime]);

  // Fungsi Kontrol Perangkat (Manual Watering)
  const handleWatering = useCallback(() => {
    if (!client || espStatus !== "Terhubung") return;

    setIsWatering(true);
    client.publish(
      `agrismart/${deviceId}/action`,
      JSON.stringify({ command: "WATER" })
    );

    setTimeout(() => setIsWatering(false), 5000);
  }, [client, espStatus, deviceId]);

  // Fungsi Kontrol Status Sensor (Pause/Resume Monitoring)
  const toggleSensorActive = useCallback(() => {
    if (!client || espStatus !== "Terhubung") return;

    const newState = !isSensorActive;
    setIsSensorActive(newState);
    client.publish(
      `agrismart/${deviceId}/action`,
      JSON.stringify({ command: newState ? "RESUME" : "PAUSE" })
    );
  }, [client, espStatus, isSensorActive, deviceId]);

  // Fungsi Pengiriman Ambang Batas Baru ke ESP32
  const updateThreshold = useCallback((newThreshold: number) => {
    if (!client || espStatus !== "Terhubung") return;

    client.publish(
      `agrismart/${deviceId}/action`,
      JSON.stringify({ command: "SET_THRESHOLD", value: newThreshold })
    );
    console.log(`🎛️ Threshold dikirim ke ESP32: ${newThreshold}%`);
  }, [client, espStatus, deviceId]);

  return (
    <AgriSmartContext.Provider
      value={{
        deviceId,
        setDeviceId,
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
      }}
    >
      {children}
    </AgriSmartContext.Provider>
  );
};

export const useAgriSmartGlobal = () => {
  const context = useContext(AgriSmartContext);
  if (context === undefined) {
    throw new Error("useAgriSmartGlobal harus digunakan di dalam AgriSmartProvider");
  }
  return context;
};