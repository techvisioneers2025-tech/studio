'use client';
import { Logo } from './logo';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div
        className={cn(
          'flex items-center gap-4 transition-all duration-700 ease-in-out',
          isMounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
      >
        <Logo className="h-16 w-16 text-primary" />
        <h1 className="text-5xl font-bold tracking-tighter text-foreground">
          App Translate
        </h1>
      </div>
    </div>
  );
}
