import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  image?: string;
  allowedDevices?: string[];
  role?: string;
  type?: string;
  isDeleted?: boolean; // Penanda untuk akun yang di-soft delete
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false); // Tab state untuk filter aktif/nonaktif

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Mengambil data dari Firestore collection "users"
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList: UserData[] = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<UserData, 'id'>)
          }))
          .filter(user => user.role !== "admin");
        
        setUsers(usersList);
      } catch (error) {
        console.error("Gagal mengambil data pengguna:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Reset pagination ke halaman 1 setiap kali user mencari atau mengganti tab
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showDeleted]);

  // Fungsi Soft Delete (Menonaktifkan)
  const handleSoftDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menonaktifkan akun ${name}?`);
    if (confirm) {
      try {
        const userRef = doc(db, "users", id);
        
        // Update Firestore
        await updateDoc(userRef, {
          isDeleted: true
        });

        // Update state lokal
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, isDeleted: true } : user
          )
        );

        alert(`Akun ${name} berhasil dinonaktifkan.`);
      } catch (error) {
        console.error("Gagal menonaktifkan akun:", error);
        alert("Terjadi kesalahan sistem saat mencoba menonaktifkan akun.");
      }
    }
  };

  // Fungsi Restore (Mengaktifkan Kembali)
  const handleRestore = async (id: string, name: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin mengaktifkan kembali akun ${name}?`);
    if (confirm) {
      try {
        const userRef = doc(db, "users", id);

        // Hapus field isDeleted dari Firestore
        await updateDoc(userRef, {
          isDeleted: deleteField()
        });

        // Update state lokal
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, isDeleted: false } : user
          )
        );

        alert(`Akun ${name} berhasil diaktifkan kembali.`);
      } catch (error) {
        console.error("Gagal mengaktifkan akun:", error);
        alert("Terjadi kesalahan sistem saat mencoba mengaktifkan akun.");
      }
    }
  };

  // Filter gabungan: Pencarian teks & Status Aktif/Nonaktif
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const isUserDeleted = user.isDeleted === true;
    const matchesStatus = showDeleted ? isUserDeleted : !isUserDeleted;
    
    return matchesSearch && matchesStatus;
  });

  // Logika Pemotongan Data untuk Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  return (
    <>
      <Head>
        <title>Manajemen Pengguna | AgriSmart Admin</title>
      </Head>

      <main className="p-4 md:p-8 grow flex flex-col gap-6 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-headline text-emerald-900 tracking-tight">
              Manajemen Pengguna
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant mt-1 font-body">
              Pantau aktivitas akun dan kelola akses pengguna sistem AgriSmart.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Tab Toggle Aktif/Nonaktif */}
            <div className="flex gap-1 bg-emerald-50/50 p-1 rounded-full border border-emerald-100">
              <button
                onClick={() => setShowDeleted(false)}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${
                  !showDeleted 
                    ? "bg-white text-emerald-800 shadow-sm border border-emerald-100" 
                    : "bg-transparent text-emerald-600 hover:text-emerald-800"
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setShowDeleted(true)}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${
                  showDeleted 
                    ? "bg-red-50 text-red-700 shadow-sm border border-red-100" 
                    : "bg-transparent text-emerald-600 hover:text-red-700"
                }`}
              >
                Nonaktif
              </button>
            </div>

            {/* Kolom Pencarian */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-emerald-100 rounded-full pl-10 pr-4 py-2 text-sm font-body text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Cari email..."
              />
            </div>
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
                  <th className="py-4 px-6 font-headline text-xs uppercase tracking-widest font-bold text-emerald-800 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="font-body text-sm divide-y divide-emerald-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-outline">
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-outline">
                      {showDeleted ? "Tidak ada akun nonaktif." : "Tidak ada pengguna aktif ditemukan."}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className={`group transition-colors ${showDeleted ? 'bg-red-50/20' : 'hover:bg-emerald-50/30'}`}>
                      <td className="py-4 px-6 flex items-center gap-3">
                        {/* Menggunakan Next Image */}
                        {user.image ? (
                          <div className={`relative w-8 h-8 rounded-full overflow-hidden border ${showDeleted ? 'border-red-100 opacity-50' : 'border-emerald-100'}`}>
                            <Image 
                              src={user.image} 
                              alt={user.fullName || "User"} 
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${showDeleted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user.fullName ? user.fullName.charAt(0) : "?"}
                          </div>
                        )}
                        <span className={`font-bold ${showDeleted ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                          {user.fullName || "Pengguna Tanpa Nama"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {user.email || "-"}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant font-mono font-medium">
                        {user.allowedDevices && user.allowedDevices.length > 0 
                          ? `${user.allowedDevices.length} Unit` 
                          : "-"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center">
                          {!showDeleted ? (
                            <button
                              onClick={() => handleSoftDelete(user.id, user.fullName)}
                              className="px-4 py-1.5 text-error hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border border-transparent hover:border-red-100"
                            >
                              Hapus
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(user.id, user.fullName)}
                              className="px-4 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border border-transparent hover:border-emerald-100"
                            >
                              Aktifkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between bg-surface-container-lowest/50 border-t border-emerald-50 mt-auto">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || currentUsers.length === 0}
              className="px-4 py-2 text-sm font-body font-bold text-on-surface-variant bg-white hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              Sebelumnya
            </button>
            <span className="text-sm font-body font-medium text-outline">
              Halaman {currentUsers.length === 0 ? 0 : currentPage} dari {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || currentUsers.length === 0}
              className="px-4 py-2 text-sm font-body font-bold text-primary bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
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