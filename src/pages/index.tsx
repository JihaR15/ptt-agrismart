import React from "react";
import Link from "next/link";
import Head from "next/head";

const LandingPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>AgriSmart - Presisi Alam dalam Genggaman</title>
      </Head>

      <div className="bg-background font-body text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed overflow-x-hidden">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-50">
          <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-6 md:px-8 py-4">
            <div className="text-2xl font-extrabold font-headline text-emerald-800">
              AgriSmart
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                className="text-emerald-700 font-bold border-b-2 border-emerald-600 font-headline text-lg tracking-tight hover:text-emerald-600 transition-all duration-300"
                href="#fitur"
              >
                Fitur
              </a>
              <a
                className="text-emerald-900/60 font-medium font-headline text-lg tracking-tight hover:text-emerald-600 transition-all duration-300"
                href="#cara-kerja"
              >
                Cara Kerja
              </a>
              <Link
                href="/auth/login"
                className="text-emerald-900/60 font-medium font-headline text-lg tracking-tight hover:text-emerald-600 transition-all duration-300"
              >
                Masuk
              </Link>
            </div>

            <Link
              href="/auth/register"
              className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold active:scale-95 transform transition-transform duration-200 hover:shadow-lg text-sm md:text-base"
            >
              Mulai Sekarang
            </Link>
          </div>
        </nav>

        <main className="pt-20">
          <section className="relative min-h-[90vh] flex items-center overflow-hidden px-6 md:px-8 py-12 md:py-0">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              <div className="z-10 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/50 text-on-secondary-fixed-variant text-xs md:text-sm font-semibold mx-auto lg:mx-0">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Teknologi IoT Masa Depan
                </div>
                <h1 className="font-headline font-extrabold text-5xl md:text-6xl lg:text-7xl text-on-surface leading-[1.1] tracking-tight">
                  Presisi Alam dalam{" "}
                  <span className="text-primary italic">Genggaman</span>
                </h1>
                <p className="text-on-surface-variant max-w-xl mx-auto lg:mx-0 text-base md:text-lg leading-relaxed">
                  Teknologi IoT tercanggih untuk perawatan pot tanaman Anda
                  secara otomatis dan cerdas. Pantau kesehatan tanaman dengan
                  presisi tinggi dari mana saja.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  <Link
                    href="/auth/register"
                    className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95 text-center"
                  >
                    Mulai Bertani Cerdas
                  </Link>
                  <button 
                  onClick={() => alert("Menampilkan pop-up video demo AgriSmart (coming soon...)")} 
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-primary hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined">
                      play_circle
                    </span>
                    Lihat Demo
                  </button>
                </div>
              </div>

              <div className="relative mt-8 lg:mt-0">
                <div className="absolute -top-10 md:-top-20 -right-10 md:-right-20 w-64 md:w-96 h-64 md:h-96 bg-primary-fixed-dim/30 blur-[80px] md:blur-[100px] rounded-full"></div>
                <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
                  <img
                    alt="AgriSmart Pot"
                    className="w-full h-[400px] md:h-[600px] object-cover"
                    src="https://images.pexels.com/photos/32702185/pexels-photo-32702185.jpeg"
                  />

                  <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white/60 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/40 shadow-lg">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest mb-1">
                          Status Sensor
                        </p>
                        <p className="text-xl md:text-2xl font-headline font-extrabold text-on-surface">
                          Optimal
                        </p>
                      </div>
                      <div className="text-right text-primary">
                        <span className="text-2xl md:text-3xl font-headline font-extrabold">
                          84%
                        </span>
                        <p className="text-[8px] md:text-[10px] font-bold uppercase">
                          Kelembapan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 md:py-12 bg-surface-container-low border-y border-outline-variant/10">
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-around items-center gap-8 md:gap-4">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-headline font-extrabold text-primary">
                  10,000+
                </p>
                <p className="text-xs md:text-sm font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                  Pecinta Tanaman
                </p>
              </div>
              <div className="w-24 h-px md:w-px md:h-12 bg-outline-variant/30"></div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-headline font-extrabold text-primary">
                  50k+
                </p>
                <p className="text-xs md:text-sm font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                  Tanaman Terpantau
                </p>
              </div>
              <div className="w-24 h-px md:w-px md:h-12 bg-outline-variant/30"></div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-headline font-extrabold text-primary">
                  99.9%
                </p>
                <p className="text-xs md:text-sm font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                  Akurasi Sensor
                </p>
              </div>
            </div>
          </section>

          <section
            id="fitur"
            className="py-20 md:py-32 px-6 md:px-8 bg-surface"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 md:mb-20 space-y-4">
                <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">
                  Fitur Cerdas untuk Tanaman Anda
                </h2>
                <p className="text-on-surface-variant max-w-2xl mx-auto text-base md:text-lg">
                  Setiap pot layak mendapatkan teknologi terbaik untuk tumbuh
                  lebih subur dan sehat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[280px]">
                <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-[2rem] flex flex-col justify-between group overflow-hidden relative shadow-sm border border-emerald-50 min-h-[280px]">
                  <div className="relative z-10">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4 icon-filled">
                      water_drop
                    </span>
                    <h3 className="text-2xl font-headline font-extrabold text-on-surface mb-2">
                      Penyiraman Otomatis
                    </h3>
                    <p className="text-on-surface-variant max-w-sm text-sm md:text-base">
                      Sensor kelembapan tanah yang super presisi, melakukan
                      penyiraman tepat saat dibutuhkan tanpa intervensi manual.
                    </p>
                  </div>
                  <img
                    alt="Watering"
                    className="absolute right-0 bottom-0 w-2/3 md:w-1/2 h-full object-cover rounded-tl-[3rem] grayscale group-hover:grayscale-0 transition-all duration-700 opacity-20 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0"
                    src="https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=800"
                  />
                </div>

                <div className="md:col-span-4 bg-primary p-8 rounded-[2rem] text-on-primary flex flex-col justify-between shadow-lg shadow-primary/20 min-h-[280px]">
                  <span className="material-symbols-outlined text-4xl icon-filled">
                    notifications_active
                  </span>
                  <div>
                    <h3 className="text-2xl font-headline font-extrabold mb-2">
                      Peringatan Kritis
                    </h3>
                    <p className="text-on-primary/80 text-sm md:text-base">
                      Notifikasi instan langsung ke ponsel Anda sebelum cadangan
                      air dalam tangki benar-benar habis.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-5 bg-surface-container-lowest p-8 rounded-[2rem] flex flex-col justify-between shadow-sm min-h-[280px] relative overflow-hidden group">
                  <img
                    alt="Dashboard"
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-10 group-hover:opacity-20"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                  />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="material-symbols-outlined text-primary text-4xl">
                        dashboard
                      </span>
                      <div className="bg-white/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter text-emerald-800">
                        Live Monitor
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-headline font-extrabold text-on-surface mb-2">
                      Monitoring Real-time
                    </h3>
                    <p className="text-on-surface-variant text-sm md:text-base">
                      Pantau kondisi vital tanaman kapan saja melalui dashboard
                      yang sangat intuitif.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-7 bg-surface-container-lowest p-8 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center gap-8 shadow-sm border border-emerald-50 min-h-[280px]">
                  <div className="flex-1">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4">
                      insights
                    </span>
                    <h3 className="text-2xl font-headline font-extrabold text-on-surface mb-2">
                      Analitik Data
                    </h3>
                    <p className="text-on-surface-variant text-sm md:text-base">
                      Dapatkan laporan mingguan mendalam dan ekspor ke PDF untuk
                      profil kesehatan tanaman Anda.
                    </p>
                  </div>
                  <div className="flex-1 w-full flex items-end gap-2 h-32 md:h-40 pt-4 md:pt-0">
                    <div className="flex-1 bg-primary/10 rounded-t-lg h-[60%] hover:bg-primary transition-colors duration-300"></div>
                    <div className="flex-1 bg-primary/10 rounded-t-lg h-[80%] hover:bg-primary transition-colors duration-300 delay-75"></div>
                    <div className="flex-1 bg-primary/30 rounded-t-lg h-[100%] hover:bg-primary transition-colors duration-300 delay-100"></div>
                    <div className="flex-1 bg-primary/10 rounded-t-lg h-[70%] hover:bg-primary transition-colors duration-300 delay-150"></div>
                    <div className="flex-1 bg-primary/10 rounded-t-lg h-[90%] hover:bg-primary transition-colors duration-300 delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="cara-kerja" className="py-20 md:py-32 bg-emerald-50/50">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div className="max-w-2xl">
                  <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-4">
                    Sederhana, Namun Bertenaga
                  </h2>
                  <p className="text-on-surface-variant text-base md:text-lg">
                    Tiga langkah mudah untuk memulai transformasi taman digital
                    Anda hari ini.
                  </p>
                </div>
                <button className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-emerald-800 transition-colors">
                  Pelajari Dokumentasi
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4 md:space-y-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center text-xl md:text-2xl font-bold text-primary shadow-sm border border-emerald-100">
                    01
                  </div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface">
                    Pasang Sensor
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                    Tancapkan sensor NodeMCU/ESP32 AgriSmart pada tanah pot
                    tanaman Anda. Desain rampingnya tidak merusak estetika pot.
                  </p>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center text-xl md:text-2xl font-bold text-primary shadow-sm border border-emerald-100">
                    02
                  </div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface">
                    Sambungkan Wi-Fi
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                    Daftarkan akun di website AgriSmart dan hubungkan perangkat
                    Anda ke jaringan internet rumah dalam hitungan detik.
                  </p>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center text-xl md:text-2xl font-bold text-primary shadow-sm border border-emerald-100">
                    03
                  </div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface">
                    Tumbuh Otomatis
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                    Sistem akan membaca data dan menyiram secara otomatis. Duduk
                    manis dan lihat tanaman Anda tumbuh subur.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 md:py-32 px-6 md:px-8">
            <div className="max-w-5xl mx-auto rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-primary to-emerald-900 p-8 md:p-24 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10">
                <img
                  alt="Texture"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=1000"
                />
              </div>
              <div className="relative z-10 space-y-8 md:space-y-10">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white leading-tight">
                  Siap Memberikan yang Terbaik untuk Tanaman Anda?
                </h2>
                <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                  Bergabunglah dengan penggiat agrikultur presisi yang telah
                  mendigitalisasi perawatan hijau mereka.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-4">
                  <Link
                    href="/auth/register"
                    className="bg-white text-primary px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-emerald-50 transition-colors shadow-xl"
                  >
                    Daftar Sekarang - Gratis
                  </Link>
                  <Link
                    href="/auth/login"
                    className="bg-transparent border-2 border-white/30 text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-white/10 transition-colors"
                  >
                    Masuk ke Dasbor
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-emerald-50/50 w-full py-10 md:py-12 border-t border-emerald-100/50">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 md:px-8 gap-6 md:gap-0">
            <div className="font-headline font-bold text-emerald-800 text-xl">
              AgriSmart
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a
                className="text-emerald-900/60 font-body text-sm hover:text-emerald-700 transition-colors"
                href="#"
              >
                Kebijakan Privasi
              </a>
              <a
                className="text-emerald-900/60 font-body text-sm hover:text-emerald-700 transition-colors"
                href="#"
              >
                Syarat & Ketentuan
              </a>
              <a
                className="text-emerald-900/60 font-body text-sm hover:text-emerald-700 transition-colors"
                href="#"
              >
                Hubungi Kami
              </a>
            </div>
            <div className="text-emerald-700/80 font-body text-sm text-center md:text-right">
              © 2026 AgriSmart. Kelompok 1 TI-3D.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
