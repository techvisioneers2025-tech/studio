import { Logo } from './logo';
import Link from 'next/link';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 border-b border-border/40 bg-card/20 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="w-7 h-7 text-primary" />
        <Link href="/" className="text-xl font-bold tracking-tight font-headline text-foreground">
          App Translate
        </Link>
        <div className="ml-auto">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
