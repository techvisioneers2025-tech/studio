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
  sourceLanguage: z.string().describe('The source language of the text (e.g., "en" for English).'),
  targetLanguage: z.string().describe('The target language for the translation (e.g., "es" for Spanish).'),
});
export type TranslateRecognizedTextInput = z.infer<typeof TranslateRecognizedTextInputSchema>;

const TranslateRecognizedTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateRecognizedTextOutput = z.infer<typeof TranslateRecognizedTextOutputSchema>;


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
  async input => {
    const {output} = await translateRecognizedTextPrompt(input);
    if (!output) {
      throw new Error('Translation failed: The AI model did not return any output.');
    }
    return output;
  }
);
