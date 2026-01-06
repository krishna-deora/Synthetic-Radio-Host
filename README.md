# 🎙️ Synthetic Radio Host

> Transform Wikipedia articles into engaging Hinglish audio podcasts with AI-powered radio hosts!

A cutting-edge AI pipeline that converts any topic into a natural-sounding, human-like Hinglish podcast conversation. Features two distinct AI radio personalities (RJ Priya and RJ Amit) who discuss topics with authentic Indian conversational flair, complete with Gen-Z slang, emotional tones, and natural speech patterns.

## ✨ Features

- 🎭 **Dual AI Hosts**: RJ Priya (energetic, Gen-Z) and RJ Amit (witty, sarcastic)
- 🗣️ **Hinglish Conversations**: Natural mix of Hindi and English with authentic fillers
- 🎵 **Emotional Tones**: Includes laughter, playfulness, and varied emotions
- 📊 **AI Evaluation**: Built-in LLM critic to assess conversation quality
- 🔄 **Improvement Suggestions**: Generates prompts for iterative enhancement
- 🌐 **Modern Web UI**: Beautiful React-based interface with glass-morphism design
- 🎯 **Topic Auto-complete**: Wikipedia-powered topic suggestions
- 📈 **Progress Tracking**: Real-time updates during podcast generation

## 🛠️ Technologies Used

### Backend
- **Python 3.8+**
- **FastAPI**: High-performance web framework
- **Groq API**: LLM inference (Llama, Mixtral, DeepSeek models)
- **Edge TTS**: Text-to-speech synthesis
- **PyDub**: Audio processing

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Modern CSS**: Glass-morphism design
- **Fetch API**: Backend communication

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+ and npm** - [Download Node.js](https://nodejs.org/)
- **FFmpeg** - Required for audio processing
  - **macOS**: `brew install ffmpeg`
  - **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
  - **Windows**: [Download from ffmpeg.org](https://ffmpeg.org/download.html)
- **Git** - [Download Git](https://git-scm.com/downloads)

## 🚀 Local Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/krishna-deora/Synthetic-Radio-Host.git
cd Synthetic-Radio-Host
```

### Step 2: Get Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in (it's FREE!)
3. Navigate to API Keys section
4. Create a new API key and copy it

### Step 3: Backend Setup

Navigate to the synthetic_radio_host directory:

```bash
cd synthetic_radio_host
```

#### Create a Virtual Environment (Recommended)

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `groq` - Groq API client
- `edge-tts` - Text-to-speech engine
- `python-dotenv` - Environment variable management
- `requests` - HTTP library
- `pydub` - Audio processing
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `python-multipart` - File upload support

#### Configure Environment Variables

Create a `.env` file in the `synthetic_radio_host` directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Groq API key:

```bash
GROQ_API_KEY=your_actual_groq_api_key_here
```

### Step 4: Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

#### Install Node Dependencies

```bash
npm install
```

This will install:
- React and React DOM
- Vite build tool
- ESLint and plugins
- All necessary dev dependencies

### Step 5: Running the Application

You need to run both backend and frontend simultaneously.

#### Terminal 1: Start the Backend Server

From the `synthetic_radio_host` directory:

```bash
python server.py
```

You should see output like:
```
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
```

The backend API will be available at `http://localhost:8000`

#### Terminal 2: Start the Frontend Development Server

From the `synthetic_radio_host/frontend` directory:

```bash
npm run dev
```

You should see output like:
```
  VITE v5.4.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

The web interface will be available at `http://localhost:5173`

### Step 6: Use the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Enter a topic in the search box (e.g., "Cricket", "Bollywood", "AI", "Space")
3. Use the auto-complete feature to select from Wikipedia suggestions
4. Click "Generate Podcast" and wait for the magic to happen!
5. Listen to your AI-generated Hinglish podcast
6. Review the evaluation scores and improvement suggestions

## 📁 Project Structure

```
AI Hackathon/
├── README.md                              # This file
├── PROJECT_DOCUMENTATION.md               # Detailed project documentation
├── HINGLISH_FILLER_WORDS_GUIDE.md        # Guide for Hinglish fillers
├── FILLER_WORD_FIX_SUMMARY.md            # Filler word implementation summary
├── .gitignore                             # Git ignore rules
│
└── synthetic_radio_host/
    ├── .env                               # Environment variables (not in git)
    ├── .env.example                       # Example environment file
    ├── requirements.txt                   # Python dependencies
    ├── README.md                          # Project-specific README
    │
    ├── server.py                          # FastAPI backend server
    ├── main.py                            # Core podcast generation logic
    ├── evaluator.py                       # LLM-based podcast evaluator
    ├── prompt_generator.py                # Improvement prompt generator
    ├── synthetic_radio_host.ipynb         # Jupyter notebook version
    │
    ├── frontend/                          # React frontend application
    │   ├── package.json                   # Node dependencies
    │   ├── vite.config.js                 # Vite configuration
    │   ├── index.html                     # Entry HTML file
    │   │
    │   └── src/
    │       ├── main.jsx                   # React entry point
    │       ├── App.jsx                    # Main App component
    │       ├── App.css                    # Global styles
    │       │
    │       └── components/
    │           ├── Hero.jsx               # Hero section
    │           ├── TopicInput.jsx         # Topic input with autocomplete
    │           ├── ProgressTracker.jsx    # Progress indicator
    │           ├── AudioPlayer.jsx        # Audio playback
    │           ├── EvaluationScoreCard.jsx # Score display
    │           └── ImprovementPromptCard.jsx # Improvement suggestions
    │
    └── output/                            # Generated audio files (auto-created)
```

## 🎯 Alternative: CLI Usage

If you prefer command-line interface:

### Using Jupyter Notebook

```bash
jupyter notebook synthetic_radio_host.ipynb
```

Run all cells and follow the prompts.

### Using Python Script

```bash
python main.py "Your Topic Here"
```

Example:
```bash
python main.py "The History of Bollywood"
```

## 🔧 Troubleshooting

### Common Issues

**1. FFmpeg not found**
```
Error: FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'
```
**Solution**: Install FFmpeg using your package manager (see Prerequisites)

**2. Port already in use**
```
ERROR: [Errno 48] Address already in use
```
**Solution**: Kill the process using the port or change the port in `server.py`

**3. Module not found errors**
```
ModuleNotFoundError: No module named 'groq'
```
**Solution**: Ensure you've activated your virtual environment and run `pip install -r requirements.txt`

**4. API Key errors**
```
Error: Invalid API Key
```
**Solution**: Check that your `.env` file contains the correct Groq API key

**5. CORS errors in browser**
```
Access to fetch blocked by CORS policy
```
**Solution**: Ensure the backend server is running on port 8000 and frontend on 5173

### Getting Help

If you encounter issues:
1. Check that all prerequisites are installed
2. Verify your API key is valid
3. Ensure both backend and frontend servers are running
4. Check the terminal output for error messages

## 🎨 Prompting Strategy

The key to achieving natural Hinglish conversations lies in the prompting approach:

- **Personas**: Two distinct AI characters with unique personalities
- **Conversational Fillers**: Explicit requests for "Arre yaar," "Matlab," "You know," etc.
- **Stage Directions**: `[laughs]`, `[umm...]`, `[playful tone]` for emotional variety
- **Interruptions**: Natural conversation flow with speaker switches
- **Structured Output**: JSON format for multi-voice TTS synthesis
- **Gen-Z Tone**: Modern slang and cultural references

## 📊 Features in Detail

### AI Evaluation System
The project includes an LLM-based critic (Mixtral 8x7B) that evaluates podcasts on:
- Natural Conversation Flow
- Emotional Tone Variety
- Hinglish Integration
- Contextual Fillers
- Overall Human-likeness

### Improvement Prompt Generator
Uses DeepSeek R1 Distill Llama 70B to generate actionable prompts for code improvements based on evaluation feedback.

### Wikipedia Integration
Auto-complete feature fetches topic suggestions from Wikipedia's OpenSearch API for accurate and relevant content.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Krishna Deora**
- GitHub: [@krishna-deora](https://github.com/krishna-deora)

## 🙏 Acknowledgments

- **Groq** for providing fast LLM inference
- **Edge TTS** for high-quality text-to-speech
- **Wikipedia** for content source
- The open-source community for amazing tools

## 🔗 Links

- [GitHub Repository](https://github.com/krishna-deora/Synthetic-Radio-Host)
- [Groq Console](https://console.groq.com)
- [Project Documentation](PROJECT_DOCUMENTATION.md)

---

**Made with ❤️ and AI** | Happy Podcasting! 🎙️
