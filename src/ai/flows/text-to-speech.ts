/**
 * @fileOverview A Genkit flow for Text-to-Speech (TTS) conversion.
 * It takes text and a language, converts it to speech using a GenAI model,
 * and returns the audio as a base64 encoded data URI.
 *
 * - textToSpeech - The primary function to call the TTS flow.
 * - TextToSpeechInputSchema - Zod schema for the input.
 * - TextToSpeechOutputSchema - Zod schema for the output.
 */

import {ai} from '../genkit-ai';
import {z} from 'genkit'; // Corrected import for Zod

// Define language codes supported by your TTS model/setup
// Ensure 'ko' (Korean) is supported if 'Kore' voice is intended for Korean.
// This list is illustrative; adjust based on actual supported languages for the voices.
const SupportedLanguagesSchema = z.enum(['en', 'en-US', 'vi', 'ko', 'es', 'fr', 'de', 'ja']);
export type SupportedLanguages = z.infer<typeof SupportedLanguagesSchema>;

export const TextToSpeechInputSchema = z.object({
  text: z.string().min(1, {message: 'Text to synthesize cannot be empty.'})
    .max(1000, {message: 'Text exceeds maximum length of 1000 characters.'})
    .describe('The text to be converted to speech.'),
  language: SupportedLanguagesSchema.describe('The language of the text (e.g., en, ko, vi). This helps select appropriate voices if not explicitly specified or for models that infer voice from language.'),
  // voiceName: z.string().optional().describe('Optional specific voice name to use (e.g., en-US-Studio-O, ko-KR-Wavenet-A).')
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The synthesized audio as a base64 encoded data URI (e.g., data:audio/mpeg;base64,...).'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  // Basic input validation (though Zod handles schema validation if this flow is called via an endpoint that uses it)
  if (!input.text.trim()) {
    throw new Error('Input text cannot be empty.');
  }
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    console.log(`TTS Flow: Synthesizing speech for text: "${input.text}" in language: ${input.language}`);

    try {
      const response = await ai.generate({
        model: "googleai/gemini-2.5-flash-preview-tts", // User specified model
        prompt: input.text, // The text to synthesize. If instructions like "Say cheerfully:" are needed, they should be part of this input.text.
        config: {
          responseModalities: ['AUDIO'], // Request audio output
          speechConfig: {
            voiceConfig: {
              // IMPORTANT: 'Kore' might be a placeholder or a custom voice.
              // For Google's prebuilt voices, use documented names (e.g., 'ko-KR-Standard-A' for Korean).
              // If 'Kore' is invalid, the API call will fail.
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            // Consider HARM_CATEGORY_CIVIC_INTEGRITY if applicable, though less common for TTS
          ],
        },
      });

      // Extract audio data URI from the response
      // The audio data is expected in response.message.content as a media part
      const audioPart = response.message?.content.find(part => part.media && part.media.contentType?.startsWith('audio/'));

      if (!audioPart || !audioPart.media?.url) {
        console.error('TTS Flow: No audio data found in response. Full response:', JSON.stringify(response, null, 2));
        const rawDetails = response.raw as Record<string, any> | undefined;
        if (rawDetails?.candidates && rawDetails.candidates[0]?.finishReason !== 'STOP' && rawDetails.candidates[0]?.finishMessage) {
            console.error('TTS Flow: Model finish message:', rawDetails.candidates[0].finishMessage);
            throw new Error(`TTS model failed: ${rawDetails.candidates[0].finishMessage}`);
        } else if (response.finishReason && String(response.finishReason).toUpperCase() !== 'STOP') {
            console.error(`TTS Flow: Model generation failed with reason: ${response.finishReason}`);
            throw new Error(`TTS model generation failed. Reason: ${response.finishReason}. Check server logs for full response details.`);
        }
        throw new Error('Failed to convert text to speech. No audio data URI received from model.');
      }

      console.log('TTS Flow: Successfully generated audio data URI.');
      return { audioDataUri: audioPart.media.url };

    } catch (error: any) {
      console.error('TTS Flow: Error during speech synthesis call:', error);
      // Log the full error object if it has more details
      if (error.response && error.response.data) {
        console.error('TTS Flow: Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      const errorMessage = error.message || 'An unknown error occurred during text-to-speech synthesis.';
      // Check if the error is from GoogleGenerativeAI and extract details if possible
      if (error.name === 'GoogleGenerativeAIError' || errorMessage.includes('GoogleGenerativeAI Error')) {
         // The error object from Google's SDK might have more specific details.
         // error.cause or error.details might be relevant depending on the SDK version.
         throw new Error(`[GoogleGenerativeAI Error]: Failed to generate speech. Details: ${errorMessage}`);
      }
      throw new Error(`Error calling Genkit for Text-to-Speech: ${errorMessage}`);
    }
  }
);
