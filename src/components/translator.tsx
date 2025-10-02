'use client';

import React, { useState, useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import {
  Camera,
  UploadCloud,
  Loader2,
  ScanText,
  Copy,
  Check,
  Languages,
  ArrowRightLeft,
  X,
} from 'lucide-react';

import { handleRecognizeText, handleTranslateText } from '@/app/actions';
import { languages, type Language } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
    setTranslatedText('');
  }

  return (
    <Card className="w-full max-w-4xl shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Image Translator</CardTitle>
        <CardDescription>Upload an image, recognize the text, and translate it to your desired language.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div
            className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/20 transition-colors"
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
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-card/50 hover:bg-card" onClick={(e) => {e.stopPropagation(); handleClear();}}>
                    <X className="h-4 w-4"/>
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="w-12 h-12" />
                <p className="font-semibold">Click to upload or drag & drop</p>
                <p className="text-xs">PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
          </div>
          {imagePreview && (
            <form action={recognizeAction}>
              <input type="hidden" name="image" value={imagePreview} />
              <RecognizeSubmitButton />
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recognized-text">Recognized Text</Label>
            <div className="relative">
              <Textarea
                id="recognized-text"
                value={recognizedText}
                readOnly
                placeholder="Text from image will appear here..."
                className="h-32 pr-10"
              />
              {recognizedText && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => handleCopy(recognizedText, 'recognized')}
                >
                  {isCopiedRec ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
          
          {recognizedText && (
            <form action={translateAction} className="space-y-4">
               <input type="hidden" name="text" value={recognizedText} />
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
                    className="h-32 pr-10"
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
      </CardContent>
    </Card>
  );
}
