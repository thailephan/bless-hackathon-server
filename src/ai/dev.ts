
import { config } from 'dotenv';
config();

import '@/ai/flows/speech-to-text.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/get-word-details.ts';
import '@/ai/flows/get-alternative-translations.ts';
import '@/ai/flows/enhance-text.ts';
import '@/ai/flows/suggest-correction.ts';
