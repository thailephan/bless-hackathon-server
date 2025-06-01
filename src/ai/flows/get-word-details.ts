/**
 * @fileOverview Provides details (definition, type, synonyms, antonyms) for a given word.
 *
 * - getWordDetails - A function that fetches details for a word.
 * - GetWordDetailsInputSchema - The Zod schema for the input.
 * - GetWordDetailsInput - The input type for the getWordDetails function.
 * - GetWordDetailsOutput - The return type for the getWordDetails function.
 */

import {ai} from '../genkit-ai';
import {z} from 'genkit';

export const GetWordDetailsInputSchema = z.object({
  word: z.string().describe('The word to get details for.'),
  language: z.enum(['en', 'en-US', 'vi']).describe('The language of the word (en: English, en-US: English (US), vi: Vietnamese).'),
});
export type GetWordDetailsInput = z.infer<typeof GetWordDetailsInputSchema>;

const GetWordDetailsOutputSchema = z.object({
  definedWord: z.string().describe('The word for which details were found (could be a normalized version of the input).'),
  type: z.string().describe('The grammatical type of the word (e.g., noun, verb, adjective). Can be empty if not applicable or found.'),
  meaning: z.string().describe('A concise definition of the word. Can be empty if not found.'),
  synonyms: z.array(z.string()).describe('A list of common synonyms for the word. Can be empty.'),
  antonyms: z.array(z.string()).describe('A list of common antonyms for the word. Can be empty.'),
});
export type GetWordDetailsOutput = z.infer<typeof GetWordDetailsOutputSchema>;

export async function getWordDetails(input: GetWordDetailsInput): Promise<GetWordDetailsOutput> {
  return getWordDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWordDetailsPrompt',
  input: {schema: GetWordDetailsInputSchema},
  output: {schema: GetWordDetailsOutputSchema},
  prompt: `You are a dictionary and thesaurus expert.
For the given word "{{word}}" in language "{{language}}":
1. Provide its grammatical type (e.g., Noun, Verb, Adjective, Adverb). If not applicable, use an empty string.
2. Provide a concise meaning or definition. If not found, use an empty string.
3. List up to 3-4 common synonyms. If none, provide an empty list.
4. List up to 3-4 common antonyms. If none, provide an empty list.
Return the original word (or its base/normalized form if appropriate) as 'definedWord'.

Word: {{{word}}}
Language: {{{language}}}

Provide the output in the specified JSON format.
If the word is highly obscure, a proper noun for which these details don't typically apply, or simply not found, try to return empty strings/lists for the respective fields rather than stating it's not found in the meaning.
`,
});

const getWordDetailsFlow = ai.defineFlow(
  {
    name: 'getWordDetailsFlow',
    inputSchema: GetWordDetailsInputSchema,
    outputSchema: GetWordDetailsOutputSchema,
  },
  async (input: GetWordDetailsInput) => {
    // Basic cleaning of the word before sending to AI
    const cleanedWord = input.word.replace(/[.,!?;:"“”（）]/g, "").trim().toLowerCase();
    if (!cleanedWord) {
      return {
        definedWord: input.word,
        type: '',
        meaning: 'No word provided or word is only punctuation.',
        synonyms: [],
        antonyms: [],
      };
    }

    const {output} = await prompt({ ...input, word: cleanedWord });
    
    // Ensure output is not null, and definedWord is set
    if (output) {
        return {
            definedWord: output.definedWord || cleanedWord,
            type: output.type || '',
            meaning: output.meaning || '',
            synonyms: output.synonyms || [],
            antonyms: output.antonyms || [],
        };
    }
    // Fallback if AI returns null output (should ideally not happen with a schema)
    return {
        definedWord: cleanedWord,
        type: '',
        meaning: 'Could not retrieve details for this word.',
        synonyms: [],
        antonyms: [],
    };
  }
);
