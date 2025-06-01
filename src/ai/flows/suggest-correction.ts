/**
 * @fileOverview Suggests corrections for a given text.
 *
 * - suggestCorrection - A function that suggests corrections.
 * - SuggestCorrectionInputSchema - The Zod schema for the input.
 * - SuggestCorrectionInput - The input type.
 * - SuggestCorrectionOutput - The return type.
 */

import {ai} from '../genkit-ai';
import {z} from 'genkit';
// LanguageCode type is implicitly available through the schema definition below
// and its usage in page.tsx for the sourceLanguage prop which is then passed here.

export const SuggestCorrectionInputSchema = z.object({
  text: z.string().describe('The text to check for corrections.'),
  language: z.enum(['en', 'en-US', 'vi']).describe('The language of the text (en: English, en-US: English (US), vi: Vietnamese).'),
});
export type SuggestCorrectionInput = z.infer<typeof SuggestCorrectionInputSchema>;

const SuggestCorrectionOutputSchema = z.object({
  correctedText: z.string().describe('The suggested corrected text. May be the same as input if no corrections are needed.'),
});
export type SuggestCorrectionOutput = z.infer<typeof SuggestCorrectionOutputSchema>;

export async function suggestCorrection(input: SuggestCorrectionInput): Promise<SuggestCorrectionOutput> {
  return suggestCorrectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCorrectionPrompt',
  input: {schema: SuggestCorrectionInputSchema},
  output: {schema: SuggestCorrectionOutputSchema},
  prompt: `You are an expert proofreader and editor.
Review the following text in "{{language}}" for any spelling, grammar, or punctuation errors.
Provide a corrected version of the text.
If the text is already perfect, return the original text.
Do not add any commentary, just the corrected text.

Original Text:
"""
{{{text}}}
"""

Corrected Text:`,
});

const suggestCorrectionFlow = ai.defineFlow(
  {
    name: 'suggestCorrectionFlow',
    inputSchema: SuggestCorrectionInputSchema,
    outputSchema: SuggestCorrectionOutputSchema,
  },
  async (input: SuggestCorrectionInput) => {
    if (!input.text.trim()) {
      return { correctedText: '' };
    }
    const {output} = await prompt(input);
    // Ensure that if the model returns null or undefined output, we fallback gracefully.
    if (output && typeof output.correctedText === 'string') {
        return output;
    }
    return { correctedText: input.text }; // Fallback to original text if AI output is not as expected
  }
);
