import React from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const fallbackProfileImage =
  "https://i.pinimg.com/474x/52/06/61/520661b91f68268b0f147778b3b87c5e.jpg";

const ProfilePage: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl border border-emerald-50 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-emerald-50 bg-emerald-50/30">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Profil Saya</h1>
          <p className="text-on-surface-variant mt-2">
            Ringkasan informasi akun yang sedang Anda gunakan.
          </p>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={session?.user?.image || fallbackProfileImage}
              alt="Foto Profil"
              width={140}
              height={140}
              unoptimized
              className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="text-center">
              <p className="text-lg font-bold text-on-surface capitalize">
                {session?.user?.fullName || "Pengguna"}
              </p>
              <p className="text-sm text-on-surface-variant">
                {session?.user?.email || "-"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-on-surface-variant">Nama Lengkap</p>
              <div className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-on-surface">
                {session?.user?.fullName || "-"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-on-surface-variant">Email</p>
              <div className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-on-surface">
                {session?.user?.email || "-"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-on-surface-variant">Role</p>
              <div className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-on-surface capitalize">
                {session?.user?.role || "-"}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/profile/edit"
                className="min-w-44 text-center rounded-xl px-5 py-3 font-bold transition-all bg-primary text-on-primary hover:bg-primary-container active:scale-95"
              >
                Edit Profil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
