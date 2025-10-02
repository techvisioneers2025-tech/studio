'use server';

/**
 * @fileOverview This file defines a Genkit flow for translating recognized text from one language to another.
 *
 * It includes:
 * - `translateRecognizedText`: An asynchronous function that takes `TranslateRecognizedTextInput` and returns `TranslateRecognizedTextOutput`.
 * - `TranslateRecognizedTextInput`: The input type for the translation flow, including the text to translate, source language, and target language.
 * - `TranslateRecognizedTextOutput`: The output type for the translation flow, containing the translated text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateRecognizedTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  sourceLanguage: z.string().describe('The source language of the text (e.g., en for English, fr for French).'),
  targetLanguage: z.string().describe('The target language for the translation (e.g., en for English, fr for French).'),
});
export type TranslateRecognizedTextInput = z.infer<typeof TranslateRecognizedTextInputSchema>;

const TranslateRecognizedTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text in the target language.'),
});
export type TranslateRecognizedTextOutput = z.infer<typeof TranslateRecognizedTextOutputSchema>;

export async function translateRecognizedText(
  input: TranslateRecognizedTextInput
): Promise<TranslateRecognizedTextOutput> {
  return translateRecognizedTextFlow(input);
}

const translateTextTool = ai.defineTool({
  name: 'translateText',
  description: 'Translates text from one language to another using an external translation API.',
  inputSchema: z.object({
    text: z.string().describe('The text to translate.'),
    targetLanguage: z.string().describe('The target language code (e.g., \"en\", \"fr\").'),
    sourceLanguage: z.string().describe('The source language code (e.g., \"en\", \"fr\").'),
  }),
  outputSchema: z.string().describe('The translated text.'),
  async resolve(input) {
    // TODO: Implement the call to the external translation API here.
    // This is a placeholder implementation.
    console.log('Calling external translation API with input:', input);
    return `Translated text (from ${input.sourceLanguage} to ${input.targetLanguage}): ${input.text}`;
  },
});

const translateRecognizedTextPrompt = ai.definePrompt({
  name: 'translateRecognizedTextPrompt',
  tools: [translateTextTool],
  input: {schema: TranslateRecognizedTextInputSchema},
  output: {schema: TranslateRecognizedTextOutputSchema},
  prompt: `You are a translation expert. The user will provide text, a source language, and a target language.  You must use the translateText tool to translate the given text to the target language.

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
    return output!;
  }
);
