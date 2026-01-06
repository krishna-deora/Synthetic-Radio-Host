# The Synthetic Radio Host

A Python pipeline that converts Wikipedia articles into natural-sounding Hinglish audio podcasts.

## Prompting Explanation (100 words)

To achieve the "Hinglish" style, I treated the LLM not just as a translator but as a creative writer (Radio Jockey). I defined two distinct personas: **RJ Priya** (energetic, Gen-Z slang) and **RJ Amit** (witty, sarcastic). 

Critically, I didn't just ask for "Hindi and English text." I explicitly requested **conversational fillers** (e.g., "Arre yaar," "Matlab," "You know"), **interruptions**, and **stage directions** like `[laughs]` or `[umm...]`. This forces the TTS to break the robotic flow. By constraining the output to a JSON structure with specific speaker roles, I ensured the content was parseable for the multi-voice synthesis engine while maintaining the chaotic, lively energy of a real Indian radio show.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: You may need `ffmpeg` installed on your system for `pydub`.*

2. Get a FREE Groq API Key from [console.groq.com](https://console.groq.com)

3. Set your API Key in `.env` or input it when running the notebook.

## Web Interface (Recommended)

1. Start the FastAPI backend:
   ```bash
   python server.py
   ```

2. In a new terminal, start the React frontend:
   ```bash
   cd frontend
   npm install  # (First time only)
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`.
4. Enter a topic (e.g., "Space", "Bollywood", "AI") and enjoy!

## CLI Usage

Open `synthetic_radio_host.ipynb` in Jupyter Notebook or VS Code and run all cells.

Or run the script directly:
```bash
python main.py "Topic Name"
```
