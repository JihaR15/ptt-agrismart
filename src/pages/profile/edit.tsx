import React, { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const fallbackProfileImage =
  "https://i.pinimg.com/474x/52/06/61/520661b91f68268b0f147778b3b87c5e.jpg";

const EditProfilePage: React.FC = () => {
  const { data: session, update } = useSession();

  const [fullName, setFullName] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setFullName(session?.user?.fullName || "");
    setImage(session?.user?.image || "");
  }, [session?.user?.fullName, session?.user?.image]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          image: image.trim(),
        }),
      });

      const response = await res.json();

      if (!res.ok || !response.status) {
        setError(response.message || "Gagal memperbarui profil.");
        return;
      }

      await update({
        fullName: response.data?.fullName || fullName.trim(),
        image: response.data?.image || image.trim(),
      });

      setSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl border border-emerald-50 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
              Edit Profil
            </h1>
            <p className="text-on-surface-variant mt-2">
              Perbarui identitas akun Anda agar data profil selalu terbaru.
            </p>
          </div>

          <Link
            href="/profile"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-emerald-50 transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Kembali
          </Link>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={image || session?.user?.image || fallbackProfileImage}
              alt="Foto Profil"
              width={140}
              height={140}
              className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="text-center">
              <p className="text-lg font-bold text-on-surface capitalize">
                {fullName || "Pengguna"}
              </p>
              <p className="text-sm text-on-surface-variant">
                {session?.user?.email || "-"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-100 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-semibold text-on-surface-variant"
              >
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-on-surface-variant"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-on-surface-variant cursor-not-allowed"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="image"
                className="text-sm font-semibold text-on-surface-variant"
              >
                URL Foto Profil
              </label>
              <input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://contoh.com/foto.jpg"
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`min-w-44 rounded-xl px-5 py-3 font-bold transition-all ${
                  isSaving
                    ? "bg-outline-variant text-on-surface cursor-not-allowed"
                    : "bg-primary text-on-primary hover:bg-primary-container active:scale-95"
                }`}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
