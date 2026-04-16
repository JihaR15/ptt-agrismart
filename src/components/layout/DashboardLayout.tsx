import React, { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import Head from "next/head";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
}) => {
  // mobile (Sembunyi/Muncul)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  // desktop (Melebar/Terlipat)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(false);

  // Mencegah masalah hydration pada server vs client rendering untuk window resize
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Auto collapse pada layar ukuran tertentu jika diinginkan (opsional)
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsDesktopCollapsed(false); // Reset collapse di ukuran tablet/mobile
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  if (!isMounted) return null; // Menghindari hydration mismatch

  return (
    <>
      <Head>
        <title>{pageTitle} | AgriSmart</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex min-h-screen relative bg-surface overflow-x-hidden">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary-fixed rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-emerald-100 rounded-full blur-[100px]"></div>
        </div>

        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          isDesktopCollapsed={isDesktopCollapsed}
        />

        <main
          className={`flex-1 min-h-screen relative z-10 transition-all duration-300 ease-in-out w-full 
        ${isDesktopCollapsed ? "lg:ml-20" : "lg:ml-72"}`} // Lebar menyusut menyesuaikan sidebar
        >
          <TopNavbar
            title={pageTitle}
            onMobileMenuClick={() => setIsMobileMenuOpen(true)}
            onDesktopMenuToggle={toggleDesktopCollapse}
            isSidebarCollapsed={isDesktopCollapsed}
          />

          <div className="pt-20 px-4 md:pt-24 md:px-8 pb-12 w-full max-w-[100vw]">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
