import React, { useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export default function App({ Component, pageProps, router }: AppProps) {
  const isLoginPage = router.pathname === "/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>SentinelMesh | Autonomous AI SOC on AMD GPU</title>
        <meta name="description" content="Autonomous Multi-Agent AI SOC accelerated on AMD ROCm Instinct GPUs" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background text-slate-100 flex flex-col antialiased">
        {!isLoginPage && (
          <Navbar
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        )}
        <div className="flex flex-1 relative">
          {!isLoginPage && (
            <Sidebar
              mobileOpen={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          )}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </>
  );
}
