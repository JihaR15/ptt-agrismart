import { useState, useEffect, useCallback } from "react";
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

export const useAgriSmart = (deviceId: string) => {
  const [espStatus, setEspStatus] = useState<"Terhubung" | "Terputus">(
    "Terputus",
  );
  const [dhtStatus, setDhtStatus] = useState<"Terhubung" | "Terputus">(
    "Terputus",
  );
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

  useEffect(() => {
    if (typeof window !== 'undefined' && deviceId) {
      const savedCache = localStorage.getItem(`agrismart_chart_${deviceId}`);
      if (savedCache) {
        setChartData(JSON.parse(savedCache));
      } else {
        setChartData([]);
      }
    }
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;

    const mqttClient = mqtt.connect("ws://43.218.43.233:9001");
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("✅ Berhasil terhubung ke MQTT Broker");
      // setEspStatus("Terhubung");

      mqttClient.subscribe(`agrismart/${deviceId}/sensor`);
      mqttClient.subscribe(`agrismart/${deviceId}/status`);
    });

    mqttClient.on("message", (topic, message) => {
      console.log("DATA MASUK:", topic, message.toString());
      setLastMessageTime(Date.now());

      try {
        const payload = JSON.parse(message.toString());

        if (topic === `agrismart/${deviceId}/sensor`) {
          setDhtStatus("Terhubung");

          setSensorData({
            temperature: payload.temperature || 0,
            humidity: payload.humidity || 0,
            soilMoisture: payload.moisture || 0,
            waterLevel: payload.waterLevel || 0,
          });

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
            localStorage.setItem(`agrismart_chart_${deviceId}`, JSON.stringify(updatedChart));
            return updatedChart.length > 15
              ? updatedChart.slice(updatedChart.length - 15)
              : updatedChart;
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
      mqttClient.end();
    };
  }, [deviceId]);

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

  const handleWatering = useCallback(() => {
    if (!client || espStatus !== "Terhubung") return;

    setIsWatering(true);
    client.publish(
      `agrismart/${deviceId}/action`,
      JSON.stringify({ command: "WATER" }),
    );

    setTimeout(() => setIsWatering(false), 5000);
  }, [client, espStatus, deviceId]);

  const toggleSensorActive = useCallback(() => {
    if (!client || espStatus !== "Terhubung") return;

    const newState = !isSensorActive;
    setIsSensorActive(newState);
    client.publish(
      `agrismart/${deviceId}/action`,
      JSON.stringify({ command: newState ? "RESUME" : "PAUSE" }),
    );
  }, [client, espStatus, isSensorActive, deviceId]);

  const updateThreshold = useCallback((newThreshold: number) => {
    if (!client || espStatus !== "Terhubung") return;

    client.publish(
      `agrismart/${deviceId}/action`,
      JSON.stringify({ command: "SET_THRESHOLD", value: newThreshold })
    );
    console.log(`🎛️ Threshold dikirim ke ESP32: ${newThreshold}%`);
  }, [client, espStatus, deviceId]);

  return {
    espStatus,
    dhtStatus,
    sensorData,
    chartData,
    isWatering,
    handleWatering,
    isSensorActive,
    toggleSensorActive,
    updateThreshold,
  };
};
