// src/main.ts (For a separate Node.js Express TypeScript backend)

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Buffer } from 'buffer'; // Import Buffer

// Load environment variables (e.g., GOOGLE_API_KEY)
dotenv.config();

// Import flows and their Zod input schemas
// Ensure these paths are correct relative to your Express project structure (e.g., src/ai/flows/)
import { enhanceText, EnhanceTextInputSchema, type EnhanceTextOutput } from './ai/flows/enhance-text';
import { getAlternativeTranslations, GetAlternativeTranslationsInputSchema, type GetAlternativeTranslationsOutput } from './ai/flows/get-alternative-translations';
import { getWordDetails, GetWordDetailsInputSchema, type GetWordDetailsOutput } from './ai/flows/get-word-details';
import { speechToText, SpeechToTextInputSchema, type SpeechToTextOutput } from './ai/flows/speech-to-text';
import { suggestCorrection, SuggestCorrectionInputSchema, type SuggestCorrectionOutput } from './ai/flows/suggest-correction';
import { textToSpeech, TextToSpeechInputSchema, type TextToSpeechOutput } from './ai/flows/text-to-speech';
import { translateText, TranslateTextInputSchema, type TranslateTextOutput } from './ai/flows/translate-text';

// You would also import your Genkit 'ai' instance if needed directly here,
// but typically flows are self-contained or import it themselves.
// import { ai } from './ai/genkit';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for potential large audio/image data URIs

// Simple GET route to check if the server is running
app.get('/', (req: Request, res: Response) => {
  res.send('LinguaCraft Express TypeScript Backend is running!');
});

// --- API Endpoint for Text Translation ---
app.post('/api/translate-text', async (req: Request, res: Response) => {
  try {
    const parsedInput = TranslateTextInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input for translate-text', details: parsedInput.error.format() });
    }
    const result: TranslateTextOutput = await translateText(parsedInput.data);
    return res.json(result);
  } catch (error: any) {
    console.error('Express API /api/translate-text error:', error);
    const errorMessage = error.message || 'Failed to translate text via Express API.';
    return res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

// --- API Endpoint for Text to Speech (Returns JSON with audioDataUri) ---
app.post('/api/text-to-speech', async (req: Request, res: Response) => {
  try {
    const parsedInput = TextToSpeechInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input for text-to-speech', details: parsedInput.error.format() });
    }
    // The Genkit flow is expected to return an object with audioDataUri
    const genkitResult: TextToSpeechOutput = await textToSpeech(parsedInput.data);
    
    // Directly return the JSON from the Genkit flow
    return res.json(genkitResult);

  } catch (error: any) {
    console.error('Express API /api/text-to-speech error:', error);
    const errorMessage = error.message || 'Failed to convert text to speech via Express API.';
    // Ensure error response is also JSON
    return res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

// --- API Endpoint for Speech to Text ---
app.post('/api/speech-to-text', async (req: Request, res: Response) => {
  try {
    const parsedInput = SpeechToTextInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input for speech-to-text', details: parsedInput.error.format() });
    }
    const result: SpeechToTextOutput = await speechToText(parsedInput.data);
    return res.json(result);
  } catch (error: any) {
    console.error('Express API /api/speech-to-text error:', error);
    const errorMessage = error.message || 'Failed to convert speech to text via Express API.';
    return res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

// --- API Endpoint for Get Word Details ---
app.post('/api/get-word-details', async (req: Request, res: Response) => {
  try {
    const parsedInput = GetWordDetailsInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input for get-word-details', details: parsedInput.error.format() });
    }
    const result: GetWordDetailsOutput = await getWordDetails(parsedInput.data);
    return res.json(result);
  } catch (error: any) {
    console.error('Express API /api/get-word-details error:', error);
    const errorMessage = error.message || 'Failed to get word details via Express API.';
    return res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

// --- API Endpoint for Get Alternative Translations ---
app.post('/api/get-alternative-translations', async (req: Request, res: Response) => {
  try {
    const parsedInput = GetAlternativeTranslationsInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input for get-alternative-translations', details: parsedInput.error.format() });
    }
    const result: GetAlternativeTranslationsOutput = await getAlternativeTranslations(parsedInput.data);
    return res.json(result);
  } catch (error: any) {
    console.error('Express API /api/get-alternative-translations error:', error);
    const errorMessage = error.message || 'Failed to get alternative translations via Express API.';
    return res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

// --- API Endpoint for Enhance Text ---
app.post('/api/enhance-text', async (req: Request, res: Response) => {
  try {
    const parsedInput = EnhanceTextInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input for enhance-text', details: parsedInput.error.format() });
    }
    const result: EnhanceTextOutput = await enhanceText(parsedInput.data);
    return res.json(result);
  } catch (error: any) {
    console.error('Express API /api/enhance-text error:', error);
    const errorMessage = error.message || 'Failed to enhance text via Express API.';
    return res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});

// --- API Endpoint for Suggest Correction ---
app.post('/api/suggest-correction', async (req: Request, res: Response) => {
  try {
    const parsedInput = SuggestCorrectionInputSchema.safeParse(req.body);
    if (!parsedInput.success) {
      return res.status(400).json({ error: 'Invalid input for suggest-correction', details: parsedInput.error.format() });
    }
    const result: SuggestCorrectionOutput = await suggestCorrection(parsedInput.data);
    return res.json(result);
  } catch (error: any) {
    console.error('Express API /api/suggest-correction error:', error);
    const errorMessage = error.message || 'Failed to suggest correction via Express API.';
    return res.status(500).json({ error: errorMessage, details: error.toString() });
  }
});


app.listen(port, () => {
  console.log(`LinguaCraft Express TypeScript server listening on http://localhost:${port}`);
});

