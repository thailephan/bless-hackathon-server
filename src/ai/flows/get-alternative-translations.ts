/**
 * @fileOverview Provides alternative translations for a given source text.
 * This flow is used by the EnhanceCard component to offer users different
 * phrasings for their translations.
 *
 * - getAlternativeTranslations - A function that fetches alternative translations.
 * - GetAlternativeTranslationsInputSchema - The Zod schema for the input.
 * - GetAlternativeTranslationsInput - The input type for the getAlternativeTranslations function.
 * - GetAlternativeTranslationsOutput - The return type for the getAlternativeTranslations function.
 */

import {ai} from '../genkit-ai';
import {z} from 'genkit';
import type { LanguageCode } from '../../lib/constants'; // Ensure type import

export const GetAlternativeTranslationsInputSchema = z.object({
  sourceText: z.string().describe('The original text to translate.'),
  sourceLanguage: z.enum(['en', 'en-US', 'vi']).describe('The language of the source text (en: English, en-US: English (US), vi: Vietnamese).'),
  targetLanguage: z.enum(['en', 'en-US', 'vi']).describe('The language to translate the text into (en: English, en-US: English (US), vi: Vietnamese).'),
  count: z.number().optional().default(3).describe('The desired number of alternative translations (e.g., 3-5).'),
});
export type GetAlternativeTranslationsInput = z.infer<typeof GetAlternativeTranslationsInputSchema>;

const GetAlternativeTranslationsOutputSchema = z.object({
  alternatives: z.array(z.string()).describe('A list of alternative translations.'),
});
export type GetAlternativeTranslationsOutput = z.infer<typeof GetAlternativeTranslationsOutputSchema>;

export async function getAlternativeTranslations(input: GetAlternativeTranslationsInput): Promise<GetAlternativeTranslationsOutput> {
  return getAlternativeTranslationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAlternativeTranslationsPrompt',
  input: {schema: GetAlternativeTranslationsInputSchema},
  output: {schema: GetAlternativeTranslationsOutputSchema},
  prompt: `You are a translation expert. Provide {{count}} alternative translations for the following text.
Source Text: "{{sourceText}}"
Source Language: {{sourceLanguage}}
Target Language: {{targetLanguage}}

Return the translations as a list of strings in the 'alternatives' field of the JSON output.
Focus on providing diverse but accurate alternatives. If the text is very short or simple, some alternatives might be very similar.
`,
});

const getAlternativeTranslationsFlow = ai.defineFlow(
  {
    name: 'getAlternativeTranslationsFlow',
    inputSchema: GetAlternativeTranslationsInputSchema,
    outputSchema: GetAlternativeTranslationsOutputSchema,
  },
  async (input: GetAlternativeTranslationsInput) => {
    if (!input.sourceText.trim()) {
      return { alternatives: [] };
    }
    const {output} = await prompt(input);
    return output || { alternatives: [] };
  }
);
