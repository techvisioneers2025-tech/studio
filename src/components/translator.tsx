'use client';

import React, { useState, useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import {
  UploadCloud,
  Loader2,
  ScanText,
  Copy,
  Check,
  Languages,
  ArrowRightLeft,
  X,
  Camera,
  Type
} from 'lucide-react';

import { handleRecognizeText, handleTranslateText } from '@/app/actions';
import { languages, type Language } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CameraInput } from './camera-input';


const initialState = { message: null, data: null };

function RecognizeSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : <ScanText />}
      Recognize Text
    </Button>
  );
}

function TranslateSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : <Languages />}
      Translate
    </Button>
  );
}

export function Translator() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isCopiedRec, setIsCopiedRec] = useState(false);
  const [isCopiedTrans, setIsCopiedTrans] = useState(false);

  const [recognizeState, recognizeAction] = useActionState(handleRecognizeText, initialState);
  const [translateState, translateAction] = useActionState(handleTranslateText, initialState);

  useEffect(() => {
    if (recognizeState?.message) {
      toast({ variant: 'destructive', title: 'Recognition Error', description: recognizeState.message });
    }
    if (recognizeState?.data) {
      setRecognizedText(recognizeState.data);
      setTypedText(recognizeState.data); // also update typed text
      setTranslatedText('');
    }
  }, [recognizeState, toast]);

  useEffect(() => {
    if (translateState?.message) {
      toast({ variant: 'destructive', title: 'Translation Error', description: translateState.message });
    }
    if (translateState?.data) {
      setTranslatedText(translateState.data);
    }
  }, [translateState, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleClear(false);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string, type: 'recognized' | 'translated') => {
    navigator.clipboard.writeText(text);
    if (type === 'recognized') {
      setIsCopiedRec(true);
      setTimeout(() => setIsCopiedRec(false), 2000);
    } else {
      setIsCopiedTrans(true);
      setTimeout(() => setIsCopiedTrans(false), 2000);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };
  
  const handleClear = (fullClear = true) => {
    if (fullClear && fileInputRef.current) {
        fileInputRef.current.value = '';
        setImagePreview(null);
    }
    setRecognizedText('');
    setTypedText('');
    setTranslatedText('');
  }
  
  const handlePhotoTaken = (imageSrc: string) => {
    handleClear(false);
    setImagePreview(imageSrc);
  };
  
  const textToTranslate = recognizedText || typedText;

  return (
    <GlassCard className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Image Translator</CardTitle>
        <CardDescription>Upload an image, use your camera, or type text to translate it to your desired language.</CardDescription>
      </CardHeader>
      <GlassCardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload"><UploadCloud className="mr-2"/> Upload</TabsTrigger>
                    <TabsTrigger value="camera"><Camera className="mr-2"/> Camera</TabsTrigger>
                    <TabsTrigger value="text"><Type className="mr-2"/> Text</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                     <div
                        className="relative border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-white/10 transition-colors mt-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {imagePreview ? (
                          <>
                            <Image
                              src={imagePreview}
                              alt="Selected image preview"
                              width={400}
                              height={300}
                              className="rounded-md object-contain max-h-64 w-full"
                            />
                             <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm" onClick={(e) => {e.stopPropagation(); handleClear();}}>
                                <X className="h-4 w-4 text-white"/>
                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-foreground/80">
                            <UploadCloud className="w-12 h-12" />
                            <p className="font-semibold">Click to upload or drag & drop</p>
                            <p className="text-xs">PNG, JPG, WEBP up to 10MB</p>
                          </div>
                        )}
                      </div>
                      {imagePreview && !recognizedText && (
                        <form action={recognizeAction} className="mt-4">
                          <input type="hidden" name="image" value={imagePreview} />
                          <RecognizeSubmitButton />
                        </form>
                      )}
                </TabsContent>
                <TabsContent value="camera">
                    <div className="mt-4">
                        <CameraInput onPhotoTaken={handlePhotoTaken} />
                         {imagePreview && !recognizedText && (
                            <form action={recognizeAction} className="mt-4">
                            <input type="hidden" name="image" value={imagePreview} />
                            <RecognizeSubmitButton />
                            </form>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="text">
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="typed-text">Enter text to translate</Label>
                        <Textarea
                          id="typed-text"
                          value={typedText}
                          onChange={(e) => {
                            setTypedText(e.target.value);
                            setRecognizedText(''); // Clear image-based text
                            setTranslatedText('');
                          }}
                          placeholder="Type or paste text here..."
                          className="h-32 bg-white/50 dark:bg-black/50"
                        />
                      </div>
                </TabsContent>
            </Tabs>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recognized-text">Source Text</Label>
            <div className="relative">
              <Textarea
                id="recognized-text"
                value={textToTranslate}
                readOnly
                placeholder="Text to translate will appear here..."
                className="h-32 pr-10 bg-white/50 dark:bg-black/50"
              />
              {textToTranslate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => handleCopy(textToTranslate, 'recognized')}
                >
                  {isCopiedRec ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
          
          {textToTranslate && (
            <form action={translateAction} className="space-y-4">
               <input type="hidden" name="text" value={textToTranslate} />
                <div className="flex items-center gap-2">
                    <Select name="sourceLanguage" value={sourceLang} onValueChange={setSourceLang}>
                        <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                        <SelectContent>
                        {languages.map((lang) => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={swapLanguages}>
                        <ArrowRightLeft className="w-4 h-4"/>
                    </Button>
                    <Select name="targetLanguage" value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger><SelectValue placeholder="Target" /></SelectTrigger>
                        <SelectContent>
                        {languages.map((lang) => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <TranslateSubmitButton />
              <div className="space-y-2">
                <Label htmlFor="translated-text">Translated Text</Label>
                <div className="relative">
                  <Textarea
                    id="translated-text"
                    value={translatedText}
                    readOnly
                    placeholder="Translation will appear here..."
                    className="h-32 pr-10 bg-white/50 dark:bg-black/50"
                  />
                  {translatedText && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => handleCopy(translatedText, 'translated')}
                    >
                      {isCopiedTrans ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
