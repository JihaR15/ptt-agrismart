import type { NextApiRequest, NextApiResponse } from 'next';
import { saveAnalyticsResult } from '../../../lib/servicefirebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }

  const { deviceId, analyticsTime, statistics, anomalies, secretToken } = req.body;

  if (secretToken !== "AGRISMART_RAHASIA_123") {
    return res.status(401).json({ message: "Akses ditolak. Token rahasia salah." });
  }

  if (!deviceId || !statistics) {
    return res.status(400).json({ message: "deviceId dan data statistik wajib diisi." });
  }

  const response = await saveAnalyticsResult(deviceId, {
    deviceId,
    analyticsTime,
    statistics,
    anomalies: anomalies || [] 
  });

  if (response.status === "success") {
    return res.status(200).json({ message: `Hasil analitik ${deviceId} berhasil diperbarui!` });
  } else {
    return res.status(500).json({ message: "Gagal menyimpan hasil analitik", error: response.message });
  }
}