import React, { useState } from "react";
import Head from "next/head";

const UserManagement: React.FC = () => {
  const [users] = useState([
    { id: 1, name: "Budi Santoso", email: "budi.s@example.com", totalDevices: 2, status: "AKTIF" },
    { id: 2, name: "Siti Rahma", email: "siti.r@agri.id", totalDevices: 1, status: "AKTIF" },
    { id: 3, name: "Agus Wijaya", email: "agus.w@mail.com", totalDevices: 0, status: "BANNED" },
    { id: 4, name: "Linda Permata", email: "linda.p@agri.id", totalDevices: 3, status: "AKTIF" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSoftDelete = (name: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menonaktifkan (Soft Delete) akun ${name}?`);
    if (confirm) {
      alert(`Akun ${name} berhasil dinonaktifkan sementara.`);
    }
  };

  return (
    <>
      <Head>
        <title>Manajemen Pengguna | AgriSmart Admin</title>
      </Head>

      <main className="p-4 md:p-8 grow flex flex-col gap-6 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-headline text-emerald-900 tracking-tight">
              Manajemen Pengguna
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant mt-1 font-body">
              Pantau aktivitas akun dan kelola akses pengguna sistem AgriSmart.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-emerald-100 rounded-full pl-10 pr-4 py-2.5 text-sm font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              placeholder="Cari email pengguna..."
            />
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 overflow-hidden flex flex-col flex-grow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="py-4 px-6 font-headline text-xs uppercase tracking-widest font-bold text-emerald-800">
                    Nama Pengguna
                  </th>
                  <th className="py-4 px-6 font-headline text-xs uppercase tracking-widest font-bold text-emerald-800">
                    Email
                  </th>
                  <th className="py-4 px-6 font-headline text-xs uppercase tracking-widest font-bold text-emerald-800">
                    Total Perangkat
                  </th>
                  <th className="py-4 px-6 font-headline text-xs uppercase tracking-widest font-bold text-emerald-800">
                    Status
                  </th>
                  <th className="py-4 px-6 font-headline text-xs uppercase tracking-widest font-bold text-emerald-800 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="font-body text-sm divide-y divide-emerald-50">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-6 text-on-surface font-bold">
                      {user.name}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {user.email}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-mono font-medium">
                      {user.totalDevices} Unit
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${
                            user.status === "AKTIF"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }
                        `}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          className="p-2 text-outline hover:text-primary hover:bg-emerald-50 rounded-xl transition-all"
                          title="Detail Pengguna"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        <button
                          onClick={() => handleSoftDelete(user.name)}
                          className="px-4 py-1.5 text-error hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border border-transparent hover:border-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between bg-surface-container-lowest/50 border-t border-emerald-50 mt-auto">
            <button className="px-4 py-2 text-sm font-body font-bold text-on-surface-variant bg-white hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100 flex items-center gap-2 shadow-sm disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              Sebelumnya
            </button>
            <span className="text-sm font-body font-medium text-outline">
              Halaman 1 dari 10
            </span>
            <button className="px-4 py-2 text-sm font-body font-bold text-primary bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100 flex items-center gap-2 shadow-sm">
              Selanjutnya
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default UserManagement;