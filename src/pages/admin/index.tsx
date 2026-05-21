import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  collection,
  getCountFromServer,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { db, realtimeDb } from "../../lib/firebase";
import mqtt from "mqtt";

const AdminDashboard: React.FC = () => {
  // === STATE METRIK UTAMA ===
  const [totalUsers, setTotalUsers] = useState<number | string>("...");
  const [activePots, setActivePots] = useState<number | string>("...");
  const [todayLogs, setTodayLogs] = useState<number | string>("...");

  // === STATE SINKRONISASI LOG (FIRESTORE) ===
  const [latestLogTime, setLatestLogTime] = useState<number | null>(null);
  const [lastLogSyncText, setLastLogSyncText] = useState("Menghitung...");

  // === STATE MQTT BROKER (SERVER) ===
  const [brokerStatus, setBrokerStatus] = useState("Menghubungkan...");
  const [isBrokerOnline, setIsBrokerOnline] = useState(false);

  // === STATE ESP32 (RTDB) ===
  const [espLastPingText, setEspLastPingText] = useState("Menunggu data...");

  useEffect(() => {
    // 1. Fetch Metrik Statis Firestore
    const fetchMetrics = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, "users"));
        setTotalUsers(usersSnap.data().count);

        const devicesSnap = await getCountFromServer(collection(db, "devices"));
        setActivePots(devicesSnap.data().count);

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const logsQuery = query(
          collection(db, "history_log"),
          where("timestamp", ">=", Timestamp.fromDate(startOfToday)),
        );
        const logsSnap = await getCountFromServer(logsQuery);
        setTodayLogs(logsSnap.data().count);
      } catch (error) {
        console.error("Gagal mengambil metrik:", error);
      }
    };

    fetchMetrics();

    // 2. Listener untuk Log Terakhir (history_log)
    const latestLogQuery = query(
      collection(db, "history_log"),
      orderBy("timestamp", "desc"),
      limit(1),
    );
    const unsubscribeLogs = onSnapshot(latestLogQuery, (snapshot) => {
      if (!snapshot.empty) {
        const latestData = snapshot.docs[0].data();
        if (latestData.timestamp) {
          setLatestLogTime(latestData.timestamp.toMillis());
        }
      } else {
        setLastLogSyncText("Belum ada log");
      }
    });

    const uniqueClientId = `admin_dash_${Math.random().toString(16).slice(2, 10)}`;

    const mqttClient = mqtt.connect("wss://agrismart-mqtt.duckdns.org:8084/", {
      clientId: uniqueClientId,
      keepalive: 60,
    });

    mqttClient.on("connect", () => {
      // Cegah update state jika klien sedang dalam proses dimatikan oleh React
      if (mqttClient.disconnecting || mqttClient.disconnected) return;

      setBrokerStatus("Server Online");
      setIsBrokerOnline(true);

      mqttClient.subscribe("agrismart/+/status"); 
      mqttClient.subscribe("agrismart/+/sensor");
    });

    mqttClient.on("message", (topic, message) => {
      const payload = message.toString();

      // Skenario A: Mendapat status dari Surat Wasiat (LWT) / Retained
      if (topic.endsWith("/status")) {
        if (payload === "online") {
          setEspLastPingText("ESP32: Online (Tersambung)");
        } else if (payload === "offline") {
          setEspLastPingText("ESP32: Offline (Koneksi Terputus)");
        }
      }

      // Skenario B: Mendapat kiriman data sensor (Artinya alat pasti sedang hidup)
      if (topic.endsWith("/sensor")) {
        setEspLastPingText("ESP32: Online (Mengirim Data)");
      }
    });

    mqttClient.on("reconnect", () => {
      if (mqttClient.disconnecting || mqttClient.disconnected) return;

      setBrokerStatus("Menghubungkan ulang...");
      setIsBrokerOnline(false);
    });

    mqttClient.on("offline", () => {
      if (mqttClient.disconnecting) return;

      setBrokerStatus("Server Offline");
      setIsBrokerOnline(false);
    });

    mqttClient.on("error", () => {
      setBrokerStatus("Server Error");
      setIsBrokerOnline(false);
    });

    return () => {
      unsubscribeLogs();
      // unsubscribePing();

      // Tambahkan param "true" untuk force disconnect agar bersih saat pindah halaman
      mqttClient.end();
    };
  }, []);

  // 5. Timer untuk memperbarui teks "Sync: X mnt lalu" setiap 1 menit
  useEffect(() => {
    if (!latestLogTime) return;

    const updateSyncText = () => {
      const diffMinutes = Math.floor((Date.now() - latestLogTime) / 60000);

      if (diffMinutes < 1) {
        setLastLogSyncText("Sync: Baru saja");
      } else if (diffMinutes < 60) {
        setLastLogSyncText(`Sync: ${diffMinutes} mnt lalu`);
      } else if (diffMinutes < 1440) {
        setLastLogSyncText(`Sync: ${Math.floor(diffMinutes / 60)} jam lalu`);
      } else {
        setLastLogSyncText(`Sync: ${Math.floor(diffMinutes / 1440)} hari lalu`);
      }
    };

    updateSyncText();
    const interval = setInterval(updateSyncText, 60000);
    return () => clearInterval(interval);
  }, [latestLogTime]);

  return (
    <>
      <Head>
        <title>Dasbor Admin | AgriSmart</title>
      </Head>

      <main className="p-4 md:p-8 grow flex flex-col gap-8 w-full mx-auto max-w-7xl">
        <div className="mb-2">
          <h2 className="text-2xl md:text-[1.75rem] font-bold font-headline text-on-surface">
            Ringkasan Sistem
          </h2>
          <p className="text-sm md:text-base font-body text-on-surface-variant mt-1">
            Pantau performa perangkat dan aktivitas pengguna secara real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Metric 1: Total Pengguna */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm border border-emerald-50 group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary-container opacity-5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-[0.75rem] font-bold text-outline uppercase tracking-wider font-body">
                  Total Pengguna
                </p>
                <h3 className="text-4xl md:text-[3.5rem] leading-none font-bold font-headline text-on-surface mt-2 tracking-tight">
                  {totalUsers}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined icon-filled">
                  group
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[0.75rem] font-body text-primary relative z-10">
              <span className="material-symbols-outlined text-[1rem]">
                trending_up
              </span>
              <span className="font-bold">Total akun terdaftar</span>
            </div>
          </div>

          {/* Metric 2: Pot Pintar Aktif */}
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                <span className="material-symbols-outlined text-[1.25rem]">
                  potted_plant
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[0.7rem] font-bold font-body">
                Terklaim
              </span>
            </div>
            <div>
              <h3 className="text-3xl md:text-[2rem] leading-tight font-bold font-headline text-on-surface">
                {activePots}
              </h3>
              <p className="text-[0.75rem] font-bold text-on-surface-variant font-body mt-1">
                Pot Pintar Aktif
              </p>
            </div>
          </div>

          {/* Metric 3: Log Data */}
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[1.25rem]">
                  history
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl md:text-[2rem] leading-tight font-bold font-headline text-on-surface">
                {todayLogs}
              </h3>
              <p className="text-[0.75rem] font-bold text-on-surface-variant font-body mt-1">
                Log Data Hari Ini
              </p>
              <p className="text-[0.65rem] text-outline font-body mt-2">
                {lastLogSyncText}
              </p>
            </div>
          </div>

          {/* Metric 4: MQTT Status (Broker Asli) */}
          <div
            className={`md:col-span-4 rounded-xl p-6 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-lg transition-colors duration-500
            ${isBrokerOnline ? "bg-linear-to-r from-primary to-primary-container shadow-primary/20" : "bg-linear-to-r from-red-600 to-red-800 shadow-red-900/20"}`}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
            <div className="flex items-center gap-4 md:gap-6 relative z-10 mb-4 md:mb-0 w-full md:w-auto">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[2rem]">
                  {isBrokerOnline ? "hub" : "portable_wifi_off"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 font-body">
                  Status MQTT Broker
                </p>
                <h3 className="text-2xl font-bold font-headline mt-1 flex items-center gap-3">
                  {brokerStatus}
                  {isBrokerOnline && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]"></span>
                  )}
                </h3>
              </div>
            </div>
            <div className="text-left md:text-right relative z-10 w-full md:w-auto">
              <p className="text-2xl font-light font-headline">
                {isBrokerOnline ? "Koneksi Web Stabil" : "Koneksi Web Terputus"}
              </p>
              <p className="text-sm text-white/90 font-bold font-body mt-2 bg-black/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                {espLastPingText.includes("Offline") 
                  ? `ESP32: Offline (${lastLogSyncText.replace("Sync: ", "")})` 
                  : espLastPingText
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
