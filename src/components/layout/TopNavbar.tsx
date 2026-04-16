import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

interface TopNavbarProps {
  title: string;
  onMobileMenuClick: () => void;
  onDesktopMenuToggle: () => void;
  isSidebarCollapsed: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  title,
  onMobileMenuClick,
  onDesktopMenuToggle,
  isSidebarCollapsed,
}) => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {
      await signOut({ callbackUrl: "/auth/login" });
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 flex justify-between items-center px-4 md:px-8 z-40 bg-surface/80 backdrop-blur-md border-b border-emerald-100/20 lg:border-none transition-all duration-300 ease-in-out
      w-full ${isSidebarCollapsed ? "lg:w-[calc(100%-5rem)]" : "lg:w-[calc(100%-18rem)]"}`}
    >
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <button
          onClick={onDesktopMenuToggle}
          className="hidden lg:flex p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
          title={isSidebarCollapsed ? "Perlebar Sidebar" : "Lipat Sidebar"}
        >
          <span className="material-symbols-outlined">
            {isSidebarCollapsed ? "menu_open" : "menu"}
          </span>
        </button>

        <h1 className="font-headline font-bold text-lg md:text-xl text-primary truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {isSidebarCollapsed && (
          <div className="relative hidden lg:block ml-2 border-l border-outline-variant/30 pl-4">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 focus:outline-none hover:bg-surface-container-low p-1.5 rounded-full pr-4 transition-colors"
            >
              <Image
                className="w-8 h-8 rounded-full object-cover border border-emerald-100/50"
                alt="Profile"
                src={
                  session?.user?.image ||
                  "https://i.pinimg.com/474x/52/06/61/520661b91f68268b0f147778b3b87c5e.jpg"
                }
                width={32}
                height={32}
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-on-surface capitalize leading-tight">
                  {session?.user?.fullName || "Pengguna"}
                </p>
                <p className="text-[10px] font-medium text-on-surface-variant capitalize">
                  {session?.user?.role || "Memuat..."}
                </p>
              </div>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                expand_more
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-emerald-50 shadow-lg rounded-xl py-2 z-50 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error font-medium hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    logout
                  </span>
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
