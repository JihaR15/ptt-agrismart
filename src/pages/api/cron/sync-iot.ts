import type { NextApiRequest, NextApiResponse } from 'next';
// Import koneksi yang sudah kamu buat sebelumnya
import { db, realtimeDb } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, get } from "firebase/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Batasi hanya untuk method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 2. Autentikasi Internal (Agar API tidak bisa ditembak sembarang orang)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log("Membaca data dari RTDB...");

    // 3. Baca node /agrismart dari Realtime Database menggunakan Client SDK
    const rtdbRef = ref(realtimeDb, '/agrismart');
    const snapshot = await get(rtdbRef);
    const data = snapshot.val();

    if (!data || !data.dht) {
      return res.status(404).json({ success: false, message: 'Data sensor tidak ditemukan di RTDB' });
    }

    // 4. Logika Penentuan Status Aksi
    let currentAction = 'Stabil';
    if (data.control?.isWatering === true) {
      currentAction = 'Penyiraman Otomatis';
    } else if (data.dht?.humidity > 80) {
      currentAction = 'Peringatan: Kelembapan Tinggi';
    }

    // 5. Simpan ke koleksi 'history_log' di Firestore menggunakan Client SDK
    const historyRef = collection(db, "history_log");
    
    const docRef = await addDoc(historyRef, {
      moisture: data.dht.humidity,
      temperature: data.dht.temperature,
      action: currentAction,
      timestamp: serverTimestamp(),
      // PENTING: Token ini yang akan memuaskan Firebase Rules yang baru saja kamu buat
      secretToken: "AGRISMART_RAHASIA_123" 
    });

    console.log(`Berhasil merekam histori IoT: ${docRef.id}`);

    // 6. Berikan respon sukses
    return res.status(200).json({
      success: true,
      message: 'Sinkronisasi berhasil via Client SDK',
      dataId: docRef.id
    });

  } catch (error: any) {
    console.error("Terjadi kesalahan:", error);
    return res.status(500).json({ 
      success: false, 
      error: 'Gagal melakukan sinkronisasi histori' 
    });
  }
}