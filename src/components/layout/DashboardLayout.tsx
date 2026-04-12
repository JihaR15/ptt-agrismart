import React, { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen relative bg-surface overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary-fixed rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-emerald-100 rounded-full blur-[100px]"></div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 w-full lg:ml-72 min-h-screen relative z-10">
        <TopNavbar
          title={pageTitle}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="pt-20 px-4 md:pt-24 md:px-8 pb-12 w-full max-w-[100vw]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
