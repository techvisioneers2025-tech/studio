'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Translator } from "@/components/translator";
import { SplashScreen } from "@/components/splash-screen";
import { useUser } from "@/firebase";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (loading || isUserLoading || !user) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <Translator />
      </main>
    </div>
  );
}
