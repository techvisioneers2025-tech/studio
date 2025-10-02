'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirebaseApp, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function OnboardingPage() {
  const { user, isUserLoading } = useUser();
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const app = useFirebaseApp();
  const db = getFirestore(app);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleContinue = async () => {
    if (!preferredLanguage) {
      toast({
        variant: 'destructive',
        title: 'No Language Selected',
        description: 'Please select your preferred language.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { preferredLanguage }, { merge: true });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Preference',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-4">
      <GlassCard className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <Logo className="w-10 h-10 text-primary" />
                <CardTitle className="font-headline text-3xl">Welcome!</CardTitle>
            </div>
          <CardDescription>
            Please select your preferred language for translations.
          </CardDescription>
        </CardHeader>
        <GlassCardContent className="grid gap-4">
          <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleContinue} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
