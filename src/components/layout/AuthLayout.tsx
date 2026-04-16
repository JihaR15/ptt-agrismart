import React from "react";
import Link from "next/link";
import { AuthLayoutProps } from "../../types/auth";
import Head from "next/head";

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  reverse = false,
}) => {
  return (
    <>
      <Head>
        <title>{reverse ? "Register" : "Login"} - AgriSmart</title>
        <meta
          name="description"
          content="AgriSmart IoT - Smart Plant Care System"
        />
      </Head>
      <main
        className={`flex h-screen w-full overflow-hidden ${reverse ? "flex-row-reverse" : "flex-row"}`}
      >
        <section className="w-full lg:w-1/2 h-full flex flex-col justify-between p-8 md:p-12 lg:p-16 bg-surface z-10 overflow-y-auto custom-scrollbar">
          <header className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                eco
              </span>
            </div>
            <span className="text-2xl font-black text-primary tracking-tight font-headline">
              AgriSmart
            </span>
          </header>

          <div className="my-auto py-8">{children}</div>

          <footer className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-outline font-medium tracking-wider uppercase pt-8 shrink-0">
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Kebijakan Privasi
              </Link>
            </div>
            <p>© 2026 AgriSmart IoT. KELOMPOK 1 TI-3D.</p>
          </footer>
        </section>

        <section className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10"></div>
          <img
            className="absolute inset-0 w-full h-full object-cover"
            alt="Modern Greenhouse"
            src="https://images.pexels.com/photos/35461528/pexels-photo-35461528.jpeg"
          />

          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 xl:p-12 2xl:p-20 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 xl:p-8 2xl:p-10 rounded-3xl xl:rounded-[2.5rem] space-y-4 xl:space-y-6 max-w-2xl">
              <span
                className="material-symbols-outlined text-primary-fixed text-3xl xl:text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                format_quote
              </span>

              {/* 3. Teks responsif: text-2xl saat di-zoom, membesar ke 4xl di layar lebar */}
              <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-headline font-extrabold text-white leading-snug xl:leading-tight">
                "Merawat tanaman pot kini lebih mudah dengan{" "}
                <span className="text-primary-fixed italic">
                  teknologi pintar
                </span>{" "}
                yang memantau kesehatan tanaman Anda."
              </h2>

              <div className="flex items-center gap-4 pt-2 xl:pt-4">
                <div className="w-8 xl:w-12 h-[2px] bg-primary-fixed"></div>
                <p className="text-primary-fixed font-bold tracking-widest uppercase text-xs xl:text-sm">
                  Visi AgriSmart 2026
                </p>
              </div>
            </div>
          </div>

          <div className="absolute top-6 right-6 xl:top-12 xl:right-12 z-20">
            <div className="backdrop-blur-lg bg-black/20 border border-white/10 rounded-2xl p-3 xl:p-4 flex items-center gap-3 xl:gap-4 text-white">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-sm xl:text-base">
                  monitoring
                </span>
              </div>
              <div>
                <p className="text-[10px] xl:text-xs font-bold opacity-70 uppercase tracking-tighter">
                  Real-time Data
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AuthLayout;
