import React from "react";

interface TopNavbarProps {
  title: string;
  onMenuClick: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ title, onMenuClick }) => {
  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-18rem)] h-16 flex justify-between items-center px-4 md:px-8 z-40 bg-surface/80 backdrop-blur-md border-b border-emerald-100/20 lg:border-none">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-headline font-bold text-lg md:text-xl text-primary truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* <div className="relative hidden md:block">
          <input
            className="bg-surface-container-low border-none rounded-full px-10 py-2 text-sm w-48 lg:w-64 focus:ring-2 focus:ring-primary outline-none text-on-surface"
            placeholder="Cari data pot..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
        </div> */}
        <div className="flex items-center gap-1 md:gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
