'use server';
/**
 * @fileOverview Recognizes text in an image using a Genkit AI flow.
 *
 * - recognizeTextInImage - A function that handles the text recognition process.
 * - RecognizeTextInImageInput - The input type for the recognizeTextInImage function.
 * - RecognizeTextInImageOutput - The return type for the recognizeTextInImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeTextInImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeTextInImageInput = z.infer<typeof RecognizeTextInImageInputSchema>;

const RecognizeTextInImageOutputSchema = z.object({
  recognizedText: z.string().describe('The text recognized in the image.'),
});
export type RecognizeTextInImageOutput = z.infer<typeof RecognizeTextInImageOutputSchema>;

export async function recognizeTextInImage(input: RecognizeTextInImageInput): Promise<RecognizeTextInImageOutput> {
  return recognizeTextInImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeTextInImagePrompt',
  input: {schema: RecognizeTextInImageInputSchema},
  output: {schema: RecognizeTextInImageOutputSchema},
  prompt: `You are an expert OCR (Optical Character Recognition) reader. Your task is to accurately extract all text from the provided image.

Extract all text from the following image:

{{media url=photoDataUri}}

Do not add any preamble or extra explanation. Only return the text that was recognized.`,
});

const recognizeTextInImageFlow = ai.defineFlow(
  {
    name: 'recognizeTextInImageFlow',
    inputSchema: RecognizeTextInImageInputSchema,
    outputSchema: RecognizeTextInImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
