import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
// Import realtimeDb dari file firebase.ts kamu
import { realtimeDb } from "../lib/firebase"; 

export const useAgriSmart = () => {
  const [espStatus, setEspStatus] = useState("Menghubungkan...");
  const [dhtStatus, setDhtStatus] = useState("Menunggu Data...");
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isWatering, setIsWatering] = useState(false);
  
  // TAMBAHAN: State untuk melacak apakah sensor aktif atau dimatikan
  const [isSensorActive, setIsSensorActive] = useState(true);

  useEffect(() => {
    // Gunakan realtimeDb di sini
    const dhtRef = ref(realtimeDb, "agrismart/dht");
    const statusRef = ref(realtimeDb, "agrismart/status/last_ping");
    const controlRef = ref(realtimeDb, "agrismart/control/isWatering");
    
    // TAMBAHAN: Referensi ke node isSensorActive
    const sensorControlRef = ref(realtimeDb, "agrismart/control/isSensorActive");

    // Listen Data DHT
    const unsubscribeDht = onValue(dhtRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSensorData({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
        });
        setDhtStatus("Terhubung");

        // Update Chart
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
          if (newData.length > 15) newData.shift(); // Batasi 15 titik data
          return newData;
        });
      } else {
        setDhtStatus("Terputus");
      }
    });

    // Listen Status ESP (Heartbeat)
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const lastPing = snapshot.val(); 
        const now = Date.now();
        
        // KARENA INTERVAL 1 MENIT:
        // Kita beri toleransi 90 detik (90000 ms) sebelum dianggap offline
        if (now - lastPing > 90000) { 
          setEspStatus("Terputus");
          setDhtStatus("Terputus");
        } else {
          setEspStatus("Terhubung");
        }
      }
    });

    // Cek status secara berkala setiap 10 detik (tidak perlu terlalu sering)
    const heartbeatCheck = setInterval(() => {
      setEspStatus((prev) => prev); 
    }, 10000);

    // Listen status penyiraman dari RTDB
    const unsubscribeControl = onValue(controlRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsWatering(snapshot.val());
      }
    });

    // TAMBAHAN: Listen status sensor aktif/tidak dari RTDB
    const unsubscribeSensorControl = onValue(sensorControlRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsSensorActive(snapshot.val());
      } else {
        // Jika node belum ada di Firebase, set default ke true
        set(sensorControlRef, true);
      }
    });

    return () => {
      unsubscribeDht();
      unsubscribeStatus();
      unsubscribeControl();
      unsubscribeSensorControl(); // Jangan lupa cleanup
      clearInterval(heartbeatCheck);
    };
  }, []);

  // Fungsi Panggil Penyiraman (Slightly improved)
  const handleWatering = async () => {
    const controlRef = ref(realtimeDb, "agrismart/control/isWatering");
    
    try {
      // Set ke true
      await set(controlRef, true);
      setIsWatering(true);

      // Kembalikan ke false setelah 5 detik agar ESP32 sempat merespons
      setTimeout(async () => {
        await set(controlRef, false);
        setIsWatering(false);
      }, 5000); 
    } catch (error) {
      console.error("Gagal update RTDB:", error);
    }
  };

  // TAMBAHAN: Fungsi untuk menghidupkan/mematikan pengiriman data sensor
  const toggleSensorActive = async () => {
    const sensorControlRef = ref(realtimeDb, "agrismart/control/isSensorActive");
    try {
      // Ubah nilai kebalikannya (jika true jadi false, jika false jadi true)
      await set(sensorControlRef, !isSensorActive);
    } catch (error) {
      console.error("Gagal toggle sensor:", error);
    }
  };

  return {
    espStatus,
    dhtStatus,
    sensorData,
    chartData,
    isWatering,
    handleWatering,
    isSensorActive,       // Export state baru
    toggleSensorActive,   // Export fungsi baru
  };
};