# The Synthetic Radio Host

A Python pipeline that converts Wikipedia articles into natural-sounding Hinglish audio podcasts featuring two AI radio hosts with distinct personalities.

## 🎯 Quick Start

For detailed setup instructions, please see the **[Main README](../README.md)** in the root directory.

### Quick Setup (TL;DR)

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: You need `ffmpeg` installed on your system for audio processing.*

2. **Get a FREE Groq API Key** from [console.groq.com](https://console.groq.com)

3. **Set your API Key** in `.env`:
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

## 🌐 Web Interface (Recommended)

1. **Start the FastAPI backend**:
   ```bash
   python server.py
   ```

2. **In a new terminal, start the React frontend**:
   ```bash
   cd frontend
   npm install  # (First time only)
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`
4. **Enter a topic** (e.g., "Space", "Bollywood", "AI") and enjoy!

## 💻 CLI Usage

### Jupyter Notebook
Open `synthetic_radio_host.ipynb` in Jupyter Notebook or VS Code and run all cells.

### Python Script
```bash
python main.py "Topic Name"
```

Example:
```bash
python main.py "The History of Cricket"
```

## ✨ Key Features

- **Dual AI Hosts**: RJ Priya (energetic, Gen-Z) and RJ Amit (witty, sarcastic)
- **Natural Hinglish**: 70% Hindi (Roman script) + 30% English code-mixing
- **Emotional Tones**: Includes laughter, playfulness, and varied emotions
- **AI Evaluation**: Built-in LLM critic (Mixtral 8x7B) to assess conversation quality
- **Improvement Prompts**: AI-generated suggestions for iterative enhancement
- **Modern UI**: Beautiful React interface with glass-morphism design
- **Topic Autocomplete**: Wikipedia-powered suggestions

## 🎨 Prompting Strategy (100 words)

To achieve the "Hinglish" style, I treated the LLM not just as a translator but as a creative writer (Radio Jockey). I defined two distinct personas: **RJ Priya** (energetic, Gen-Z slang) and **RJ Amit** (witty, sarcastic). 

Critically, I didn't just ask for "Hindi and English text." I explicitly requested **conversational fillers** (e.g., "Arre yaar," "Matlab," "You know"), **interruptions**, and **stage directions** like `[laughs]` or `[umm...]`. This forces the TTS to break the robotic flow. By constraining the output to a JSON structure with specific speaker roles, I ensured the content was parseable for the multi-voice synthesis engine while maintaining the chaotic, lively energy of a real Indian radio show.

## 🏗️ Architecture

### Three-LLM System
1. **Llama 3.3 70B** - Script generation
2. **Mixtral 8x7B** - Quality evaluation (critic)
3. **GPT-OSS 120B** - Improvement prompt generation

### Components
- **main.py** - Core podcast generation pipeline
- **server.py** - FastAPI backend server
- **evaluator.py** - AI podcast critic
- **prompt_generator.py** - Improvement prompt creator
- **frontend/** - React application

## 📊 Evaluation System

The system automatically evaluates generated podcasts on:
- **Hinglish Quality** (25% weight)
- **Conversational Naturalness** (30% weight)
- **Emotional Expression** (20% weight)
- **Content Coherence** (15% weight)
- **Host Chemistry** (10% weight)

Results include detailed feedback, strengths, and areas for improvement.

## 📚 Documentation

- **[Main README](../README.md)** - Complete setup guide with troubleshooting
- **[Project Documentation](../PROJECT_DOCUMENTATION.md)** - Detailed architecture and design
- **[Hinglish Filler Words Guide](../HINGLISH_FILLER_WORDS_GUIDE.md)** - Filler word usage guidelines
- **[Filler Word Fix Summary](../FILLER_WORD_FIX_SUMMARY.md)** - Implementation details

## 🔧 Requirements

- Python 3.8+
- Node.js 16+ (for frontend)
- FFmpeg (for audio processing)
- Groq API Key (free)

## 🎯 Tech Stack

**Backend**: Python, FastAPI, Groq API, Edge TTS  
**Frontend**: React, Vite, Modern CSS  
**Audio**: Microsoft Edge TTS, MP3  

## 🤝 Contributing

See the main [README](../README.md) for contribution guidelines.

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

---

**For detailed setup instructions, troubleshooting, and more, see the [Main README](../README.md)** 📖
