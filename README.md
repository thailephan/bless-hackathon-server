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
- `src/ai/flows/` – AI-powered feature modules (translation, speech, word details, etc.)
- `src/lib/` – Shared constants and utilities
- `src/index.ts` – Server entry point

## Setup & Development
1. **Clone the repository:**
   ```cmd
   git clone <your-repo-url>
   cd bless-hackathon/server
   ```
2. **Install dependencies:**
   ```cmd
   npm install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in required API keys and settings (if needed).
4. **Run the server in development:**
   ```cmd
   npm run dev
   ```
5. **Build for production:**
   ```cmd
   npm run build
   ```
6. **Start the production server:**
   ```cmd
   npm start
   ```

## Related Repositories
- [Bless Function Module](../bless) – Blockless function backend
- [Bless Client](../client) – React + Vite frontend

## License
This project is for hackathon/demo purposes. For production or open-source use, please add your own license file.

---
> [GitHub Repository](https://github.com/your-org/bless-hackathon-server)
