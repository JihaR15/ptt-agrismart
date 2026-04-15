import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { realtimeDb } from "../lib/firebase"; 

export const useAgriSmart = () => {
  const [espStatus, setEspStatus] = useState("Menghubungkan...");
  const [dhtStatus, setDhtStatus] = useState("Menunggu Data...");
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isWatering, setIsWatering] = useState(false);
  const [isSensorActive, setIsSensorActive] = useState(true);

  // TAMBAHAN: State khusus untuk melacak waktu ping terakhir
  const [lastPing, setLastPing] = useState<number>(0);

  useEffect(() => {
    const dhtRef = ref(realtimeDb, "agrismart/dht");
    const statusRef = ref(realtimeDb, "agrismart/status/last_ping");
    const controlRef = ref(realtimeDb, "agrismart/control/isWatering");
    const sensorControlRef = ref(realtimeDb, "agrismart/control/isSensorActive");

    // Listen Data DHT
    const unsubscribeDht = onValue(dhtRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSensorData({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
        });

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
          if (newData.length > 15) newData.shift(); 
          return newData;
        });
      }
    });

    // Listen Status ESP (Hanya menyimpan waktu terakhir ke state)
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setLastPing(snapshot.val()); // Simpan timestamp ke state
      }
    });

    // Listen status penyiraman
    const unsubscribeControl = onValue(controlRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsWatering(snapshot.val());
      }
    });

    // Listen status sensor aktif
    const unsubscribeSensorControl = onValue(sensorControlRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsSensorActive(snapshot.val());
      } else {
        set(sensorControlRef, true);
      }
    });

    return () => {
      unsubscribeDht();
      unsubscribeStatus();
      unsubscribeControl();
      unsubscribeSensorControl();
    };
  }, []);

  // EFEK BARU: Mengecek koneksi secara berkala setiap 5 detik
  useEffect(() => {
    const checkConnection = () => {
      if (lastPing === 0) return; // Abaikan jika data dari Firebase belum termuat
      
      const now = Date.now();
      // Toleransi 90 detik (90000 ms)
      if (now - lastPing > 90000) { 
        setEspStatus("Terputus");
        setDhtStatus("Terputus");
      } else {
        setEspStatus("Terhubung");
        setDhtStatus("Terhubung");
      }
    };

    // Langsung cek saat nilai lastPing berubah
    checkConnection(); 
    
    // Buat interval yang berjalan mandiri
    const heartbeatCheck = setInterval(checkConnection, 5000); 

    return () => clearInterval(heartbeatCheck);
  }, [lastPing]); // Interval akan di-reset jika lastPing diperbarui

  // Fungsi Panggil Penyiraman
  const handleWatering = async () => {
    const controlRef = ref(realtimeDb, "agrismart/control/isWatering");
    try {
      await set(controlRef, true);
      setIsWatering(true);
      setTimeout(async () => {
        await set(controlRef, false);
        setIsWatering(false);
      }, 5000); 
    } catch (error) {
      console.error("Gagal update RTDB:", error);
    }
  };

  // Fungsi Toggle Sensor
  const toggleSensorActive = async () => {
    const sensorControlRef = ref(realtimeDb, "agrismart/control/isSensorActive");
    try {
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
    isSensorActive,       
    toggleSensorActive,   
  };
};