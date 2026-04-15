import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import AuthLayout from "../../components/layout/AuthLayout";
import { signIn } from "next-auth/react";

const Register: React.FC = () => {
  const router = useRouter();

  // 1. State Management untuk menangkap inputan
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 2. UX State untuk error dan loading
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 3. Logika Menembak API Register
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email: email,
          password: password,
        }),
      });

      const response = await res.json();

      if (response.status) {
        console.log("Registrasi Berhasil:", response.message);
        router.push("/auth/login");
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      console.error("Register Error:", err);
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
      setIsLoading(true);
      signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <AuthLayout reverse={true}>
      <div className="max-w-md w-full mx-auto space-y-8 my-auto py-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
            Mulai Bertani Pintar
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Daftarkan diri Anda untuk mulai memantau dan mengontrol pot pintar
            Anda dari mana saja.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-start gap-3 border border-red-500 animate-pulse">
            <span className="material-symbols-outlined text-red-600">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-on-surface-variant px-1"
                htmlFor="name"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline">
                  <span className="material-symbols-outlined text-[20px]">
                    person
                  </span>
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Jiha Ramdhan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-on-surface-variant px-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-on-surface-variant px-1"
                htmlFor="password"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline">
                  <span className="material-symbols-outlined text-[20px]">
                    lock
                  </span>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-12 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-on-primary font-bold py-4 rounded-full shadow-lg transition-all text-lg flex justify-center items-center gap-2 ${
              isLoading
                ? "bg-outline-variant cursor-not-allowed"
                : "bg-primary hover:bg-primary-container active:scale-95"
            }`}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-on-surface">
                  sync
                </span>
                <span>Memproses...</span>
              </>
            ) : (
              "Daftar Akun Baru"
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-4 text-outline font-semibold">
                Atau daftar dengan
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-semibold py-3 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <img
              alt="Google"
              className="w-5 h-5"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
            />
            <span>Google Account</span>
          </button>
        </form>

        <p className="text-center text-on-surface-variant">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-bold hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
