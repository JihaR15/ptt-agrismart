import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isDesktopCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  isDesktopCollapsed,
}) => {
  const router = useRouter();
  const isActive = (path: string) => router.pathname.startsWith(path);

  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {
      await signOut({ callbackUrl: "/auth/login" });
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onMobileClose}
        ></div>
      )}

      <aside
        className={`fixed left-0 top-0 h-screen border-r border-emerald-100/20 bg-surface lg:bg-emerald-50/50 backdrop-blur-xl flex flex-col py-8 z-50 transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isDesktopCollapsed ? "lg:w-20" : "w-72"} 
        `}
      >
        <div
          className={`px-4 mb-10 flex items-center ${isDesktopCollapsed ? "justify-center" : "justify-between px-8"}`}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined icon-filled">eco</span>
            </div>
            <div
              className={`transition-opacity duration-200 overflow-hidden ${isDesktopCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
            >
              <h2 className="text-2xl font-headline font-extrabold tracking-tight text-primary whitespace-nowrap">
                AgriSmart
              </h2>
              <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest whitespace-nowrap">
                Agronomis Modern
              </p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-on-surface-variant hover:text-error p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav
          className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden ${isDesktopCollapsed ? "px-2" : "px-4"}`}
        >
          {!isAdmin && (
            <>
              <Link
                href="/dashboard"
                onClick={onMobileClose}
                className={`flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg group
              ${isDesktopCollapsed ? "justify-center px-0" : "px-4"}
              ${isActive("/dashboard") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}
            `}
                title={isDesktopCollapsed ? "Dasbor" : ""}
              >
                <span
                  className={`material-symbols-outlined ${isActive("/dashboard") ? "text-primary" : "text-outline group-hover:text-primary"}`}
                >
                  dashboard
                </span>
                {!isDesktopCollapsed && (
                  <span className="font-headline whitespace-nowrap">
                    Dasbor
                  </span>
                )}
              </Link>
              <Link
                href="/devices"
                onClick={onMobileClose}
                className={`flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg group
              ${isDesktopCollapsed ? "justify-center px-0" : "px-4"}
              ${isActive("/devices") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}
            `}
                title={isDesktopCollapsed ? "Manajemen Perangkat" : ""}
              >
                <span
                  className={`material-symbols-outlined ${isActive("/devices") ? "text-primary" : "text-outline group-hover:text-primary"}`}
                >
                  precision_manufacturing
                </span>
                {!isDesktopCollapsed && (
                  <span className="font-headline whitespace-nowrap">
                    Manajemen Perangkat
                  </span>
                )}
              </Link>
              <Link
                href="/history"
                onClick={onMobileClose}
                className={`flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg group
              ${isDesktopCollapsed ? "justify-center px-0" : "px-4"}
              ${isActive("/history") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}
            `}
                title={isDesktopCollapsed ? "Riwayat" : ""}
              >
                <span
                  className={`material-symbols-outlined ${isActive("/history") ? "text-primary" : "text-outline group-hover:text-primary"}`}
                >
                  history
                </span>
                {!isDesktopCollapsed && (
                  <span className="font-headline whitespace-nowrap">
                    Riwayat
                  </span>
                )}
              </Link>

              <Link
                href="/analytics"
                onClick={onMobileClose}
                className={`flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg group
              ${isDesktopCollapsed ? "justify-center px-0" : "px-4"}
              ${isActive("/analytics") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}
            `}
                title={isDesktopCollapsed ? "Analitik Cerdas" : ""}
              >
                <span
                  className={`material-symbols-outlined ${isActive("/analytics") ? "text-primary" : "text-outline group-hover:text-primary"}`}
                >
                  insights
                </span>
                {!isDesktopCollapsed && (
                  <span className="font-headline whitespace-nowrap">
                    Analitik Cerdas
                  </span>
                )}
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin"
                onClick={onMobileClose}
                className={`flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg group
              ${isDesktopCollapsed ? "justify-center px-0" : "px-4"}
              ${router.pathname === "/admin" ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}
            `}
                title={isDesktopCollapsed ? "Admin Panel" : ""}
              >
                <span
                  className={`material-symbols-outlined ${isActive("/admin") ? "text-primary" : "text-outline group-hover:text-primary"}`}
                >
                  admin_panel_settings
                </span>
                {!isDesktopCollapsed && (
                  <span className="font-headline whitespace-nowrap">
                    Admin Panel
                  </span>
                )}
              </Link>

              <Link
                href="/admin/users"
                onClick={onMobileClose}
                className={`flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg group
              ${isDesktopCollapsed ? "justify-center px-0" : "px-4"}
              ${isActive("/admin/users") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}
            `}
                title={isDesktopCollapsed ? "Pengguna" : ""}
              >
                <span
                  className={`material-symbols-outlined ${isActive("/admin/users") ? "text-primary" : "text-outline group-hover:text-primary"}`}
                >
                  people
                </span>
                {!isDesktopCollapsed && (
                  <span className="font-headline whitespace-nowrap">
                    Pengguna
                  </span>
                )}
              </Link>

              <Link
                href="/admin/devices"
                onClick={onMobileClose}
                className={`flex items-center gap-3 py-3 font-medium transition-all duration-200 rounded-lg group
              ${isDesktopCollapsed ? "justify-center px-0" : "px-4"}
              ${isActive("/admin/devices") ? "text-primary-container font-bold border-r-4 border-primary bg-emerald-100/50" : "text-on-surface-variant hover:bg-emerald-50"}
            `}
                title={isDesktopCollapsed ? "Master Perangkat" : ""}
              >
                <span
                  className={`material-symbols-outlined ${isActive("/admin/devices") ? "text-primary" : "text-outline group-hover:text-primary"}`}
                >
                  qr_code_2
                </span>
                {!isDesktopCollapsed && (
                  <span className="font-headline whitespace-nowrap">
                    Master Perangkat
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>

        <div
          className={`mt-auto pt-4 border-t border-emerald-100/20 lg:border-none transition-all duration-300
           ${isDesktopCollapsed ? "hidden lg:hidden" : "px-4 block"}
        `}
        >
          <Link
            href="/profile"
            onClick={onMobileClose}
            className="p-4 bg-surface-container-lowest rounded-2xl mb-4 flex items-center gap-3 border border-emerald-50 shadow-sm hover:bg-emerald-50/70 transition-colors"
            title="Profil Saya"
          >
            <Image
              className="w-10 h-10 rounded-full object-cover shrink-0"
              alt="Profile"
              src={
                session?.user?.image ||
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
              }
              width={40}
              height={40}
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-on-surface truncate capitalize">
                {session?.user?.fullName || "Memuat..."}
              </p>
              <p className="text-xs text-on-surface-variant truncate capitalize">
                {session?.user?.role || "Memuat..."}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-red-100 hover:text-red-600 transition-all duration-300 rounded-lg group active:scale-95"
          >
            <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 shrink-0">
              logout
            </span>
            <span className="font-headline whitespace-nowrap">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
