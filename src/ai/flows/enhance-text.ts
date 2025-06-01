/**
 * @fileOverview Enhances a given text based on a user-provided instruction.
 * This flow is used by the EnhanceCard component to apply modifications like
 * summarization, style changes, or keyword highlighting to translated text.
 *
 * - enhanceText - A function that enhances text using an instruction.
 * - EnhanceTextInputSchema - The Zod schema for the input.
 * - EnhanceTextInput - The input type for the enhanceText function.
 * - EnhanceTextOutput - The return type for the enhanceText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { LanguageCode } from '@/lib/constants'; // Ensure type import

export const EnhanceTextInputSchema = z.object({
  text: z.string().describe('The text to enhance.'),
  language: z.enum(['en', 'en-US', 'vi']).describe('The language of the text (en: English, en-US: English (US), vi: Vietnamese).'),
  instruction: z.string().describe('The instruction detailing how to enhance the text.'),
});
export type EnhanceTextInput = z.infer<typeof EnhanceTextInputSchema>;

const EnhanceTextOutputSchema = z.object({
  enhancedText: z.string().describe('The enhanced text.'),
});
export type EnhanceTextOutput = z.infer<typeof EnhanceTextOutputSchema>;

export async function enhanceText(input: EnhanceTextInput): Promise<EnhanceTextOutput> {
  return enhanceTextFlow(input);
}

const prompt = ai.definePrompt({
    name: 'enhanceTextWithInstructionPrompt',
    input: {schema: EnhanceTextInputSchema},
    output: {schema: EnhanceTextOutputSchema},
    prompt: `You are an expert text editor. You will be given a text and an instruction.
Modify the text according to the instruction, maintaining the original language ({{language}}).
Only output the modified text.

Original Text:
"""
{{{text}}}
"""

Instruction:
"""
{{{instruction}}}
"""

Modified Text:`,
});


const enhanceTextFlow = ai.defineFlow(
  {
    name: 'enhanceTextFlow',
    inputSchema: EnhanceTextInputSchema,
    outputSchema: EnhanceTextOutputSchema,
  },
  async (input: EnhanceTextInput) => {
    if (!input.text.trim() || !input.instruction.trim()) {
      return { enhancedText: input.text }; // Return original if no text or instruction
    }
    
    const {output} = await prompt(input);
    
    if (output && typeof output.enhancedText === 'string') {
        return { enhancedText: output.enhancedText.trim() };
    }
    
    // Fallback if parsing fails or structure is not as expected, try to get text directly
    const genResponse = await ai.generate({ 
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: `You are an expert text editor. You will be given a text and an instruction.
Modify the text according to the instruction, maintaining the original language (${input.language}).
Only output the modified text.

Original Text:
"""
${input.text}
"""

Instruction:
"""
${input.instruction}
"""

Modified Text:`,
        config: { temperature: 0.5 } 
      });

    const textResponse = genResponse.text?.trim();
    if (textResponse) {
        return { enhancedText: textResponse };
    }

    return { enhancedText: input.text }; // Fallback to original text if all else fails
  }
);
