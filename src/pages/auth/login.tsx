import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

import AuthLayout from "../../components/layout/AuthLayout";

const Login: React.FC = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        console.log("Login Berhasil!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Terjadi kesalahan sistem. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <AuthLayout reverse={false}>
      <div className="max-w-md w-full mx-auto space-y-8 my-auto py-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
            Selamat Datang
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Kelola ekosistem pertanian Anda dengan presisi teknologi masa depan.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-start gap-3 border border-red-500 animate-pulse">
            <span className="material-symbols-outlined text-red-600">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
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
              <div className="flex justify-between px-1">
                <label
                  className="text-sm font-semibold text-on-surface-variant"
                  htmlFor="password"
                >
                  Kata Sandi
                </label>
                {/* <Link
                  href="#"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Lupa Password?
                </Link> */}
              </div>
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
                  placeholder="••••••••"
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
              "Masuk Sekarang"
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-4 text-outline font-semibold">
                Atau
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-semibold py-3 rounded-full hover:bg-surface-container-low transition-colors disabled:opacity-50"
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
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="text-primary font-bold hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
