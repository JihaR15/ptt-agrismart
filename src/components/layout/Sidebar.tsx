import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const isActive = (path: string) => router.pathname.startsWith(path);

  const { data: session } = useSession();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {
      console.log("Proses Logout NextAuth...");
      await signOut({ callbackUrl: "/auth/login" });
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 border-r border-emerald-100/20 bg-surface lg:bg-emerald-50/50 backdrop-blur-xl flex flex-col py-8 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="px-8 mb-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined icon-filled">eco</span>
            </div>
            <div>
              <h2 className="text-2xl font-headline font-extrabold tracking-tight text-primary">
                AgriSmart
              </h2>
              <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest">
                Agronomis Modern
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-on-surface-variant hover:text-error p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 rounded-lg group ${isActive("/dashboard") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}`}
          >
            <span
              className={`material-symbols-outlined ${isActive("/dashboard") ? "text-primary" : "text-outline group-hover:text-primary"}`}
            >
              dashboard
            </span>
            <span className="font-headline">Dasbor</span>
          </Link>
          <Link
            href="/devices"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 rounded-lg group ${isActive("/devices") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}`}
          >
            <span
              className={`material-symbols-outlined ${isActive("/devices") ? "text-primary" : "text-outline group-hover:text-primary"}`}
            >
              precision_manufacturing
            </span>
            <span className="font-headline">Manajemen Perangkat</span>
          </Link>
          <Link
            href="/history"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 rounded-lg group ${isActive("/history") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}`}
          >
            <span
              className={`material-symbols-outlined ${isActive("/history") ? "text-primary" : "text-outline group-hover:text-primary"}`}
            >
              history
            </span>
            <span className="font-headline">Riwayat</span>
          </Link>
        </nav>

        <div className="px-4 mt-auto pt-4 border-t border-emerald-100/20 lg:border-none">
          <div className="p-4 bg-surface-container-lowest rounded-2xl mb-4 flex items-center gap-3 border border-emerald-50 shadow-sm">
            <img
              className="w-10 h-10 rounded-full object-cover"
              alt="Profile"
              src={
                session?.user?.image ||
                "https://i.pinimg.com/474x/52/06/61/520661b91f68268b0f147778b3b87c5e.jpg"
              }
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-on-surface truncate capitalize">
                {session?.user?.fullName || "Memuat..."}
              </p>
              <p className="text-xs text-on-surface-variant truncate capitalize">
                {session?.user?.role || "Memuat..."}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-red-100 hover:text-red-600 transition-all duration-300 rounded-lg group active:scale-95"
          >
            <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">
              logout
            </span>
            <span className="font-headline">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
