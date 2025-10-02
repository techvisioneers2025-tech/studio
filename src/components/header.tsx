import { ScanText } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 border-b border-border/40 bg-card/20 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-2">
        <ScanText className="w-7 h-7 text-primary" />
        <Link href="/" className="text-xl font-bold tracking-tight font-headline text-foreground">
          SnapTranslate
        </Link>
      </div>
    </header>
  );
}
