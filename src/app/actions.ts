'use server';

import { recognizeTextInImage } from '@/ai/flows/recognize-text-in-image';
import { translateRecognizedText } from '@/ai/flows/translate-recognized-text';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { z } from 'zod';
import { serverTimestamp } from 'firebase/firestore';

type FormState = {
  message: string | null;
  data?: any;
  timestamp?: number;
};

const recognizeSchema = z.object({
  image: z.string().min(1, { message: 'Image data is missing.' }),
});

const translateSchema = z.object({
  text: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
});

const saveTranslationSchema = z.object({
    userId: z.string(),
    sourceText: z.string(),
    translatedText: z.string(),
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
});

export async function handleRecognizeText(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = recognizeSchema.safeParse({
    image: formData.get('image'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.image?.[0] ?? 'Invalid image data.',
      timestamp: Date.now(),
    };
  }
  
  try {
    const result = await recognizeTextInImage({ photoDataUri: validatedFields.data.image });
    if (!result.recognizedText) {
        return { message: 'No text could be recognized in the image. Please try a clearer image.', timestamp: Date.now() };
    }
    return { data: result.recognizedText, message: null, timestamp: Date.now() };
  } catch (error) {
    console.error('Recognition error:', error);
    return { message: 'Failed to recognize text. Please try again later.', timestamp: Date.now() };
  }
}

export async function handleTranslateText(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = translateSchema.safeParse({
    text: formData.get('text'),
    sourceLanguage: formData.get('sourceLanguage'),
    targetLanguage: formData.get('targetLanguage'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid translation data.',
      timestamp: Date.now(),
    };
  }

  const { text, sourceLanguage, targetLanguage } = validatedFields.data;

  if (!text.trim()) {
    return { message: 'There is no text to translate.', timestamp: Date.now() };
  }

  try {
    const result = await translateRecognizedText({ text, sourceLanguage, targetLanguage });
    return { data: result.translatedText, message: null, timestamp: Date.now() };
  } catch (error) {
    console.error('Translation error:', error);
    return { message: 'Failed to translate text. Please try again later.', timestamp: Date.now() };
  }
}

export async function handleSaveTranslation(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = saveTranslationSchema.safeParse({
        userId: formData.get('userId'),
        sourceText: formData.get('sourceText'),
        translatedText: formData.get('translatedText'),
        sourceLanguage: formData.get('sourceLanguage'),
        targetLanguage: formData.get('targetLanguage'),
    });

    if (!validatedFields.success) {
        return {
        message: 'Invalid translation data for saving.',
        timestamp: Date.now(),
        };
    }

    try {
        const { firebaseApp } = initializeFirebase();
        const firestore = getFirestore(firebaseApp);
        const historyCollectionRef = collection(firestore, 'users', validatedFields.data.userId, 'translationHistory');
        
        addDocumentNonBlocking(historyCollectionRef, {
            ...validatedFields.data,
            timestamp: serverTimestamp(),
        });

        return { message: 'Translation saved successfully!', timestamp: Date.now() };
    } catch (error: any) {
        console.error('Save translation error:', error);
        return { message: 'Failed to save translation.', timestamp: Date.now() };
    }
}
