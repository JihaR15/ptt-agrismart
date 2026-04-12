import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout pageTitle="Dasbor Utama">
      {/* 1. Baris Metrik Sensor (3 Kartu) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kartu Kelembapan Tanah */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-primary rounded-r-md"></div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-on-surface-variant">
              Kelembapan Tanah
            </span>
            <span className="material-symbols-outlined text-primary">
              water_drop
            </span>
          </div>
          <div>
            {/* TODO (Danendra): Hubungkan angka ini ke Firebase Realtime DB */}
            <h3 className="text-5xl font-headline font-extrabold text-on-surface">
              68<span className="text-2xl text-on-surface-variant">%</span>
            </h3>
            <p className="text-sm font-body text-primary mt-2 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">
                trending_up
              </span>{" "}
              Optimal
            </p>
          </div>
        </div>

        {/* Kartu Suhu Lingkungan */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-tertiary rounded-r-md"></div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-on-surface-variant">
              Suhu Lingkungan
            </span>
            <span className="material-symbols-outlined text-tertiary">
              thermostat
            </span>
          </div>
          <div>
            <h3 className="text-5xl font-headline font-extrabold text-on-surface">
              24.5<span className="text-2xl text-on-surface-variant">°C</span>
            </h3>
            <p className="text-sm font-body text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
              Stabil
            </p>
          </div>
        </div>

        {/* Kartu Level Tangki Air */}
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 border border-emerald-50 shadow-sm">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-primary-container rounded-r-md"></div>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-on-surface-variant">
              Level Tangki Air
            </span>
            <span className="material-symbols-outlined text-primary-container">
              layers
            </span>
          </div>
          <div>
            <h3 className="text-5xl font-headline font-extrabold text-on-surface">
              82<span className="text-2xl text-on-surface-variant">%</span>
            </h3>
            <div className="w-full bg-surface-container-low h-2 rounded-full mt-4 overflow-hidden">
              {/* TODO: Hubungkan style width ke variabel state */}
              <div
                className="bg-primary-container h-full"
                style={{ width: "82%" }}
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
              Grafik Tren 24 Jam
            </h2>
            <p className="text-sm text-on-surface-variant">
              Statistik real-time sensor IoT
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-surface-container-low text-xs font-bold text-primary transition-colors hover:bg-surface-container">
              Kelembapan
            </button>
            <button className="px-4 py-2 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Suhu
            </button>
          </div>
        </div>

        {/* Placeholder Grafik (Nanti diganti library seperti Recharts oleh Danendra) */}
        <div className="w-full h-80 bg-surface-container-low rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-primary/40 mb-2">
                monitoring
              </span>
              <p className="text-on-surface-variant font-medium">
                Memuat Data Visualisasi...
              </p>
            </div>
          </div>

          {/* Ilustrasi Garis (Pure CSS/SVG) */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 240 Q 150 180, 300 220 T 600 160 T 900 190 T 1200 140"
              fill="none"
              opacity="0.6"
              stroke="#006947"
              strokeLinecap="round"
              strokeWidth="3"
            ></path>
            <path
              d="M0 240 Q 150 180, 300 220 T 600 160 T 900 190 T 1200 140 V 320 H 0 Z"
              fill="url(#grad1)"
              opacity="0.1"
            ></path>
            <defs>
              <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#006947" stopOpacity="1"></stop>
                <stop offset="100%" stopColor="#006947" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
