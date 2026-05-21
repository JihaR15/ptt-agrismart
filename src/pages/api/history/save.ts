import type { NextApiRequest, NextApiResponse } from 'next';
import { saveHistoryLog } from '../../../lib/servicefirebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { deviceId, temperature, humidity, moisture, waterLevel, secretToken } = req.body;

    if (secretToken !== "AGRISMART_RAHASIA_123") {
      return res.status(401).json({ message: "Akses ditolak. Token rahasia salah." });
    }

    if (!deviceId) {
      return res.status(400).json({ message: "deviceId wajib dikirim" });
    }

    const dataToSave = {
      deviceId,
      temperature: Number(temperature) || 0,
      humidity: Number(humidity) || 0,
      moisture: Number(moisture) || 0,
      waterLevel: Number(waterLevel) || 0,
      action: "Stabil",
    };

    const result = await saveHistoryLog(dataToSave);

    if (result.status === 'success') {
      return res.status(200).json({ message: "Data sensor berhasil disimpan ke riwayat!" });
    } else {
      return res.status(500).json({ message: "Gagal menyimpan data ke database server." });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}