import type { NextApiRequest, NextApiResponse } from 'next';
import mqtt from 'mqtt';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Koneksi ke backend broker (TCP)
    const client = mqtt.connect('mqtt://broker.emqx.io:1883');

    client.on('connect', () => {
      // Mengirim trigger ke ESP32
      client.publish('agrismart/iot/pump', 'TRIGGER_WATER', (err) => {
        client.end(); // Langsung tutup koneksi agar memori server tidak bocor
        
        if (err) {
          return res.status(500).json({ success: false, error: 'Gagal mengirim perintah MQTT' });
        }
        return res.status(200).json({ success: true, message: 'Perintah siram berhasil dikirim' });
      });
    });

    client.on('error', (error) => {
      res.status(500).json({ success: false, error: 'Koneksi Broker Gagal' });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}