'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, doc, setDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

import { Header } from '@/components/header';
import { SplashScreen } from '@/components/splash-screen';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languages, Language } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type TranslationHistoryItem = {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: Timestamp;
};

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [preferredLanguage, setPreferredLanguage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Memoize the query to prevent re-renders
  const historyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'translationHistory'),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, user]);

  const { data: history, isLoading: isHistoryLoading } = useCollection<TranslationHistoryItem>(historyQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user?.preferredLanguage) {
      setPreferredLanguage(user.preferredLanguage);
    }
  }, [user, isUserLoading, router]);

  const handleLanguageSave = async () => {
    if (!user || !preferredLanguage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a language.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, { preferredLanguage }, { merge: true });
      toast({
        title: 'Success',
        description: 'Your preferred language has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Preference',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getLanguageName = (code: string) => {
    return languages.find(l => l.code === code)?.name || code;
  }
  
  const sortedLanguages = useMemo(() => {
    if (!preferredLanguage) return languages;
    const preferred = languages.find(lang => lang.code === preferredLanguage);
    const others = languages.filter(lang => lang.code !== preferredLanguage);
    return preferred ? [preferred, ...others] : languages;
  }, [preferredLanguage]);

  if (isUserLoading || !user) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <Header />
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8">
        <GlassCard className="w-full max-w-4xl">
          <CardContent className="p-6 grid md:grid-cols-2 gap-8">
            <section className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Manage your application preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">Preferred Language</Label>
                        <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select your preferred language" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortedLanguages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                        <Label>Auto-run OCR on image upload</Label>
                        </div>
                        <Switch disabled />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                        <Label>Show bounding boxes on image</Label>
                        </div>
                        <Switch disabled/>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleLanguageSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </section>
            <section>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Translation History</CardTitle>
                   <CardDescription>Your saved translations will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {isHistoryLoading ? (
                       <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                       </div>
                    ) : history && history.length > 0 ? (
                      <div className="space-y-4">
                        {history.map((item) => (
                          <div key={item.id} className="text-sm">
                            <p className="font-semibold text-foreground truncate">{item.sourceText}</p>
                            <p className="text-primary">{item.translatedText}</p>
                            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                               <span>{getLanguageName(item.sourceLanguage)} to {getLanguageName(item.targetLanguage)}</span>
                               <span>{new Date(item.timestamp.seconds * 1000).toLocaleDateString()}</span>
                            </div>
                           <Separator className="mt-4"/>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-10">
                        <p>No history yet.</p>
                        <p>Saved translations will be shown here.</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </section>
          </CardContent>
        </GlassCard>
      </main>
    </div>
  );
}
