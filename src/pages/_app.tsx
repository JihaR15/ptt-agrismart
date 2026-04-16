import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import DashboardLayout from "../components/layout/DashboardLayout";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();

  const isAuthPage =
    router.pathname.startsWith("/auth") || router.pathname === "/";

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Dasbor Utama";
    if (path.startsWith("/devices")) return "Manajemen Perangkat";
    if (path.startsWith("/history")) return "Riwayat Aktivitas";
    return "AgriSmart";
  };

  return (
    <SessionProvider session={session}>
      {isAuthPage ? (
        <Component {...pageProps} />
      ) : (
        <DashboardLayout pageTitle={getPageTitle(router.pathname)}>
          <Component {...pageProps} />
        </DashboardLayout>
      )}
    </SessionProvider>
  );
}
