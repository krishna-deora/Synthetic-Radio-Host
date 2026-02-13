<div align="center">

# 🎙️ Synthetic Radio Host

### Transform Wikipedia into Engaging Hinglish Audio Podcasts

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/krishna-deora/Synthetic-Radio-Host)

**A cutting-edge AI pipeline that converts any Wikipedia topic into natural-sounding Hinglish podcast conversations featuring two Gen-Z AI hosts (RJ Priya and RJ Amit) with authentic Indian conversational flair.**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎭 **Dual AI Hosts**
Two distinct personalities: RJ Priya (energetic Gen-Z) and RJ Amit (witty, sarcastic)

### 🗣️ **Natural Hinglish**
Authentic mix of Hindi and English with contextual fillers and Gen-Z slang

### 🎵 **Emotional Tones**
Includes laughter, playfulness, and varied emotions for human-like conversations

</td>
<td width="50%">

### 📊 **AI Evaluation**
Built-in LLM critic (Mixtral 8x7B) assesses conversation quality on 5 metrics

### 🔄 **Smart Improvements**
AI-generated prompts (DeepSeek R1) for iterative enhancement

### 🌐 **Modern Web UI**
Beautiful React interface with glassmorphism design and real-time progress tracking

</td>
</tr>
</table>

## 🎬 Demo

<div align="center">

### How It Works

```
📝 Enter Topic → 🔍 Wikipedia Fetch → 🤖 AI Script Generation → 🎙️ TTS Synthesis → 📊 AI Evaluation → 🎧 Podcast Ready!
```

**Example**: Type "Cricket" → Get a 2-minute Hinglish podcast with RJ Priya and RJ Amit discussing cricket history, famous players, and fun facts!

</div>

### Key Capabilities

- ⚡ **Fast Generation**: ~30-60 seconds per podcast
- 🎯 **Topic Auto-complete**: Wikipedia-powered suggestions
- 📈 **Real-time Progress**: Stage-by-stage updates
- 🎛️ **Playback Controls**: Speed control (1x-4x), download option
- 🏆 **Quality Scores**: Detailed evaluation with strengths and improvements


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

## 🚀 Quick Start

### Prerequisites

Ensure you have these installed:
- **Python 3.8+** → [Download](https://www.python.org/downloads/)
- **Node.js 16+** → [Download](https://nodejs.org/)
- **FFmpeg** → [Installation Guide](https://ffmpeg.org/download.html)
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt-get install ffmpeg`

### Installation

<details>
<summary><b>1️⃣ Clone Repository</b></summary>

```bash
git clone https://github.com/krishna-deora/Synthetic-Radio-Host.git
cd Synthetic-Radio-Host
```
</details>

<details>
<summary><b>2️⃣ Get Groq API Key (FREE)</b></summary>

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up/login (completely free!)
3. Create API key and copy it
</details>

<details open>
<summary><b>3️⃣ Backend Setup</b></summary>

```bash
cd synthetic_radio_host

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your_key_here
```
</details>

<details open>
<summary><b>4️⃣ Frontend Setup</b></summary>

```bash
cd frontend

# Install dependencies
npm install
```
</details>

<details open>
<summary><b>5️⃣ Run Application</b></summary>

**Terminal 1 - Backend**:
```bash
cd synthetic_radio_host
python server.py
# Server runs on http://localhost:8000
```

**Terminal 2 - Frontend**:
```bash
cd synthetic_radio_host/frontend
npm run dev
# App runs on http://localhost:5173
```

**Open browser**: Navigate to `http://localhost:5173` 🎉
</details>

### Usage

1. **Enter a topic** (e.g., "Bollywood", "Space", "Cricket")
2. **Use autocomplete** to select from Wikipedia suggestions
3. **Click "Generate Podcast"** and wait ~30-60 seconds
4. **Listen to your AI-generated Hinglish podcast!**
5. **Review evaluation scores** and improvement suggestions

> 💡 **Tip**: Start with popular topics like "Mumbai", "Cricket", or "Bollywood" for best results!

---

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


## 📚 Documentation

Comprehensive documentation for developers and contributors:

- 📖 **[Architecture Guide](ARCHITECTURE.md)** - System design, components, and data flow
- 🔌 **[API Reference](API_REFERENCE.md)** - Complete API documentation with examples
- 🤝 **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to this project
- 📝 **[Changelog](CHANGELOG.md)** - Version history and updates

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><b>FFmpeg not found</b></summary>

```
Error: FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'
```
**Solution**: Install FFmpeg using your package manager
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`
- Windows: [Download from ffmpeg.org](https://ffmpeg.org/download.html)
</details>

<details>
<summary><b>Port already in use</b></summary>

```
ERROR: [Errno 48] Address already in use
```
**Solution**: Kill the process using the port or change port in `server.py`
```bash
# Find process on port 8000
lsof -ti:8000 | xargs kill -9
```
</details>

<details>
<summary><b>Module not found errors</b></summary>

```
ModuleNotFoundError: No module named 'groq'
```
**Solution**: Ensure virtual environment is activated and dependencies installed
```bash
source venv/bin/activate
pip install -r requirements.txt
```
</details>

<details>
<summary><b>Invalid API Key</b></summary>

```
Error: Invalid API Key
```
**Solution**: Verify your `.env` file contains the correct Groq API key
```bash
# Check .env file
cat synthetic_radio_host/.env
# Should show: GROQ_API_KEY=your_actual_key_here
```
</details>

## 🏗️ Project Structure

```
AI Hackathon/
├── README.md                    # Project overview and setup
├── ARCHITECTURE.md              # System architecture documentation
├── API_REFERENCE.md             # API endpoint documentation
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── LICENSE                      # MIT License
│
└── synthetic_radio_host/
    ├── main.py                  # Core podcast generation logic
    ├── server.py                # FastAPI backend server
    ├── evaluator.py             # AI quality evaluation
    ├── prompt_generator.py      # Improvement suggestions
    ├── requirements.txt         # Python dependencies
    │
    └── frontend/                # React web application
        ├── src/
        │   ├── App.jsx          # Main application
        │   ├── components/      # React components
        │   └── ...
        └── package.json         # Node dependencies
```

## 🎯 Use Cases

- 🎓 **Education**: Convert textbook topics into engaging audio lessons
- 📰 **News Summaries**: Turn Wikipedia current events into quick audio briefs
- 🧠 **Learning**: Absorb information while commuting or exercising
- 🎨 **Content Creation**: Generate podcast content quickly
- 🔬 **Research**: Get audio overviews of complex topics

## 🤖 AI Models Used

This project leverages **3 different LLMs** for distinct purposes:

| Model | Purpose | Provider |
|-------|---------|----------|
| **Llama 3.3 70B Versatile** | Script generation | Groq |
| **Mixtral 8x7B Instruct** | Quality evaluation | Groq |
| **DeepSeek R1 Distill Llama 70B** | Improvement suggestions | Groq |

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Reporting bugs
- Suggesting features  
- Submitting pull requests
- Coding standards

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Krishna Deora**
- GitHub: [@krishna-deora](https://github.com/krishna-deora)
- Project: [Synthetic Radio Host](https://github.com/krishna-deora/Synthetic-Radio-Host)

## 🙏 Acknowledgments

- **Groq** for providing fast and free LLM inference
- **Microsoft Edge TTS** for high-quality text-to-speech
- **Wikipedia** for rich content source
- The open-source community for amazing tools and libraries

## ⭐ Star This Project

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ and AI** | **Happy Podcasting! 🎙️**

[Report Bug](https://github.com/krishna-deora/Synthetic-Radio-Host/issues) • [Request Feature](https://github.com/krishna-deora/Synthetic-Radio-Host/issues) • [Documentation](ARCHITECTURE.md)

</div>

