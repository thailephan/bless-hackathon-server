/**
 * @fileOverview Text translation flow using AI, supporting English, English (US), and Vietnamese.
 *
 * - translateText - A function that translates text from one language to another.
 * - TranslateTextInputSchema - The Zod schema for the input.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '../genkit-ai';
import {z} from 'genkit';

export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  sourceLanguage: z
    .enum(['en', 'en-US', 'vi'])
    .describe('The source language of the text (en: English, en-US: English (US), vi: Vietnamese).'),
  targetLanguage: z
    .enum(['en', 'en-US', 'vi'])
    .describe('The target language for the translation (en: English, en-US: English (US), vi: Vietnamese).'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are a professional translator specializing in English, English (US), and Vietnamese.
Your task is to translate the given text from the source language to the target language.
Pay close attention to idioms, cultural references, and nuances in both languages to provide an accurate and natural-sounding translation.

Source Language: {{sourceLanguage}}
Target Language: {{targetLanguage}}
Text to Translate: {{{text}}}

Translation:`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
