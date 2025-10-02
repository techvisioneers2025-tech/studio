'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirebaseApp } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Loader2 } from 'lucide-react';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const auth = useAuth();
  const app = useFirebaseApp();
  const { toast } = useToast();
  const router = useRouter();

  const db = getFirestore(app);

  const handleUserSetup = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        preferredLanguage: null,
      });
    }

    const userData = (await getDoc(userRef)).data();
    if (userData?.preferredLanguage === null) {
      router.push('/onboarding');
    } else {
      router.push('/');
    }
  };

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both email and password.',
      });
      return;
    }
    setIsLoading(true);
    try {
      let userCredential;
      if (action === 'signIn') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      await handleUserSetup(userCredential.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description:
          error.code === 'auth/invalid-credential'
            ? 'Incorrect email or password.'
            : error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleUserSetup(result.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true);
    try {
      await signInAnonymously(auth);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Guest Sign-In Failed',
        description: error.message,
      });
    } finally {
      setIsGuestLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-4">
      <GlassCard className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <Logo className="w-10 h-10 text-primary" />
                <CardTitle className="font-headline text-3xl">App Translate</CardTitle>
            </div>
          <CardDescription>
            Sign in to save your translation history.
          </CardDescription>
        </CardHeader>
        <GlassCardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isGoogleLoading || isGuestLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isGoogleLoading || isGuestLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleAuthAction('signIn')}
              disabled={isLoading || isGoogleLoading || isGuestLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleAuthAction('signUp')}
              disabled={isLoading || isGoogleLoading || isGuestLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/10 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading || isGuestLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}{' '}
            Google
          </Button>
          <Button
            variant="ghost"
            onClick={handleGuestSignIn}
            disabled={isLoading || isGoogleLoading || isGuestLoading}
          >
            {isGuestLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue as Guest
          </Button>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
