'use server';

/**
 * @fileOverview This file defines a Genkit flow for translating text from one language to another using a generative AI model.
 *
 * It includes:
 * - `translateRecognizedText`: An asynchronous function that takes `TranslateRecognizedTextInput` and returns `TranslateRecognizedTextOutput`.
 * - `TranslateRecognizedTextInput`: The input type for the flow, including the text to translate, source language, and target language.
 * - `TranslateRecognizedTextOutput`: The output type for the flow, containing the translated text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateRecognizedTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  sourceLanguage: z
    .string()
    .describe(
      'The source language of the text (e.g., "en" for English, "ISO" for romanized script).'
    ),
  targetLanguage: z
    .string()
    .describe(
      'The target language for the translation (e.g., "te" for Telugu).'
    ),
});
export type TranslateRecognizedTextInput = z.infer<
  typeof TranslateRecognizedTextInputSchema
>;

const TranslateRecognizedTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateRecognizedTextOutput = z.infer<
  typeof TranslateRecognizedTextOutputSchema
>;

export async function translateRecognizedText(
  input: TranslateRecognizedTextInput
): Promise<TranslateRecognizedTextOutput> {
  return translateRecognizedTextFlow(input);
}

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

const translateRecognizedTextFlow = ai.defineFlow(
  {
    name: 'translateRecognizedTextFlow',
    inputSchema: TranslateRecognizedTextInputSchema,
    outputSchema: TranslateRecognizedTextOutputSchema,
  },
  async (input) => {
    // Map language code to Aksharamukha script name.
    const scriptMapping: Record<string, string> = {
      te: 'Telugu',
      en: 'ISO', // Assuming English input is romanized
      hi: 'Devanagari',
      ta: 'Tamil',
      kn: 'Kannada',
      ml: 'Malayalam',
      bn: 'Bengali',
      gu: 'Gujarati',
      pa: 'Gurmukhi',
      or: 'Oriya',
      rom: 'ISO',
    };

    const targetScript = scriptMapping[input.targetLanguage];

    // If we have a valid script, try Aksharamukha first.
    if (targetScript) {
      try {
        console.log(`Attempting transliteration to ${targetScript} via Aksharamukha.`);
        const response = await fetch(
          'https://aksharamukha-plugin.appspot.com/api/transliterate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source: 'ISO', // Assuming English/romanized input
              target: targetScript,
              text: input.text,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.text) {
             console.log('Aksharamukha API success.');
             return { translatedText: result.text };
          }
        }
        // Log the error but don't throw, so we can fall back.
        const errorBody = await response.text();
        console.error(
          `Aksharamukha API failed with status ${response.status}:`,
          errorBody
        );

      } catch (error) {
        console.error('Error calling Aksharamukha API:', error);
      }
    }
    
    // Fallback to Genkit AI if the API call fails or is not applicable
    console.log('Falling back to generative AI model for translation.');
    const { output } = await translateRecognizedTextPrompt(input);
    if (!output) {
      throw new Error(
        'Translation failed: The AI model did not return any output.'
      );
    }
    return output;
  }
);
