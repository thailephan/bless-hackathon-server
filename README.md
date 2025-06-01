# Bless Hackathon Server

This is the backend server for the Bless Hackathon project. It provides AI-powered translation, speech-to-text, text-to-speech, word details, and language enhancement APIs for the client app.

## Features
- **Translation API**: Translate text between supported languages (English, Vietnamese, etc.).
- **Speech-to-Text**: Convert spoken audio to text.
- **Text-to-Speech**: Generate audio from text in supported languages.
- **Word Details**: Get definitions, synonyms, antonyms, IPA, and more for any word.
- **Text Enhancement**: Suggest corrections and alternative translations.
- **Modular AI Flows**: Each feature is implemented as a flow in `src/ai/flows/` for easy extension.

## Tech Stack
- **Node.js** (TypeScript)
- **Express** (or similar framework)
- **OpenAI/Genkit/Other AI APIs**

## Project Structure
- `src/ai/flows/` — AI-powered feature modules (translation, speech, word details, etc.)
- `src/lib/` — Shared constants and utilities
- `src/main.ts` — Server entry point

## Setup & Development

1. **Install dependencies:**
   ```cmd
   cd server
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in required API keys and settings (if needed).

3. **Run the server in development:**
   ```cmd
   npm run dev
   ```

4. **Build for production:**
   ```cmd
   npm run build
   ```

5. **Start the production server:**
   ```cmd
   npm start
   ```

## License
This project is for hackathon/demo purposes. For production or open-source use, please add your own license file.

## Credits
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [OpenAI](https://openai.com/) / [Genkit](https://github.com/google/genkit)

---
For the client app, see the `../client` directory.
