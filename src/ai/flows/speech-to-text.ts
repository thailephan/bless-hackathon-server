/**
 * @fileOverview Converts spoken language into written text, with optional translation.
 *
 * - speechToText - A function that handles the speech-to-text conversion and optional translation process.
 * - SpeechToTextInputSchema - The Zod schema for the input.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  sourceLanguage: z.enum(['en', 'en-US', 'vi']).describe('The language of the audio data (en: English, en-US: English (US), vi: Vietnamese).'),
  targetLanguage: z
    .enum(['en', 'en-US', 'vi'])
    .describe('The language to translate the audio to. If the same as sourceLanguage, no translation occurs (en: English, en-US: English (US), vi: Vietnamese).'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text.'),
  translation: z.string().describe('The translated text, if targetLanguage is different from sourceLanguage.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'speechToTextPrompt',
  input: {schema: SpeechToTextInputSchema},
  output: {schema: SpeechToTextOutputSchema},
  prompt: `You are a multilingual translator. You will transcribe the audio data into text, and then translate it to a different language if necessary.

  Here is the audio data: {{media url=audioDataUri}}
  Source Language: {{{sourceLanguage}}}
  Target Language: {{{targetLanguage}}}

  If the source and target language are the same, return the transcription as the translation as well.
  Otherwise translate the text.
  Transcription:`,
});

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

