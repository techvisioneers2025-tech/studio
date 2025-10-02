'use server';

/**
 * @fileOverview This file defines a Genkit flow for transliterating text from one script to another using the Aksharamukha API.
 *
 * It includes:
 * - `translateRecognizedText`: An asynchronous function that takes `TranslateRecognizedTextInput` and returns `TranslateRecognizedTextOutput`.
 * - `TranslateRecognizedTextInput`: The input type for the flow, including the text to transliterate and the target script.
 * - `TranslateRecognizedTextOutput`: The output type for the flow, containing the transliterated text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateRecognizedTextInputSchema = z.object({
  text: z.string().describe('The text to be transliterated.'),
  sourceLanguage: z.string().describe('The source script (e.g., Roman, Devanagari). This is mapped from language codes.'),
  targetLanguage: z.string().describe('The target script for the transliteration (e.g., Telugu, Tamil).'),
});
export type TranslateRecognizedTextInput = z.infer<typeof TranslateRecognizedTextInputSchema>;

const TranslateRecognizedTextOutputSchema = z.object({
  translatedText: z.string().describe('The transliterated text in the target script.'),
});
export type TranslateRecognizedTextOutput = z.infer<typeof TranslateRecognizedTextOutputSchema>;

// Mapping from our app's language codes to Aksharamukha script names
const scriptMap: Record<string, string> = {
    'en': 'Roman',
    'hi': 'Devanagari',
    'te': 'Telugu',
    'ta': 'Tamil',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'mr': 'Devanagari', // Marathi uses Devanagari
    'gu': 'Gujarati',
    'bn': 'Bengali',
    'pa': 'Gurmukhi',
    'or': 'Oriya',
    'roman': 'Roman',
};


export async function translateRecognizedText(
  input: TranslateRecognizedTextInput
): Promise<TranslateRecognizedTextOutput> {
  return translateRecognizedTextFlow(input);
}


const translateRecognizedTextFlow = ai.defineFlow(
  {
    name: 'translateRecognizedTextFlow',
    inputSchema: TranslateRecognizedTextInputSchema,
    outputSchema: TranslateRecognizedTextOutputSchema,
  },
  async input => {
    const { text, sourceLanguage, targetLanguage } = input;

    const sourceScript = scriptMap[sourceLanguage] || 'Roman';
    const targetScript = scriptMap[targetLanguage];

    if (!targetScript) {
      throw new Error(`Unsupported target language for transliteration: ${targetLanguage}`);
    }

    // Aksharamukha treats Roman as the default/pivot script.
    // The API is GET based.
    const url = new URL('https://aksharamukha.appspot.com/api/v1/transliterate');
    url.searchParams.append('source', sourceScript);
    url.searchParams.append('target', targetScript);
    url.searchParams.append('text', text);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Aksharamukha API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      return { translatedText: result.transliterated_text };

    } catch (error) {
      console.error("Failed to call Aksharamukha API", error);
      // Fallback to the GenAI model if the direct API call fails
      return await callGenAiTranslator(input);
    }
  }
);


const callGenAiTranslator = async (input: TranslateRecognizedTextInput) : Promise<TranslateRecognizedTextOutput> => {
     const translateRecognizedTextPrompt = ai.definePrompt({
        name: 'translateRecognizedTextPrompt',
        input: {schema: TranslateRecognizedTextInputSchema},
        output: {schema: TranslateRecognizedTextOutputSchema},
        prompt: `You are a translation expert. The user will provide text, a source language, and a target language. You must translate the given text to the target language.

        Do not add any extra explanation, preamble, or any other text that is not part of the translation. Only return the translated text.

        Text: {{{text}}}
        Source Language: {{{sourceLanguage}}}
        Target Language: {{{targetLanguage}}}`,
    });
    const {output} = await translateRecognizedTextPrompt(input);
    return output!;
}
