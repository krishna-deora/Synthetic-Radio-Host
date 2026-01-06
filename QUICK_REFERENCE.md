# 🚀 Quick Reference

Fast reference guide for common tasks and commands.

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/krishna-deora/Synthetic-Radio-Host.git
cd Synthetic-Radio-Host

# Backend setup
cd synthetic_radio_host
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# Frontend setup
cd frontend
npm install
```

## ▶️ Running the Application

**Terminal 1 (Backend)**:
```bash
cd synthetic_radio_host
source venv/bin/activate
python server.py
```

**Terminal 2 (Frontend)**:
```bash
cd synthetic_radio_host/frontend
npm run dev
```

**Access**: http://localhost:5173

## 🔑 Environment Variables

Create `.env` file in `synthetic_radio_host/` directory:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Get your free API key at: https://console.groq.com

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Start podcast generation |
| `/api/status/:job_id` | GET | Get job status/progress |
| `/api/download/:filename` | GET | Download MP3 file |
| `/api/wikipedia/suggest?query=` | GET | Wikipedia autocomplete |

## 🧪 Testing

### Test Backend API

```bash
# Start generation
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Cricket"}'

# Check status (replace JOB_ID)
curl http://localhost:8000/api/status/JOB_ID

# Download (replace FILENAME)
curl -O http://localhost:8000/api/download/FILENAME.mp3
```

### Manual Testing Checklist

- [ ] Topic autocomplete works
- [ ] Generation starts successfully
- [ ] Progress updates in real-time
- [ ] Audio plays correctly
- [ ] Evaluation displays properly
- [ ] Download works
- [ ] Error handling works

## 🛠️ Common Commands

### Python/Backend

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py

# Run directly (CLI mode)
python main.py "Your Topic"

# Update dependencies
pip freeze > requirements.txt
```

### Node.js/Frontend

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Update dependencies
npm update
```

### Git

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "feat: your feature description"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

## 🐛 Debugging

### Backend Issues

```bash
# Check if port 8000 is in use
lsof -ti:8000

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Check Python version
python --version

# Check installed packages
pip list

# Verify environment variables
cat .env
```

### Frontend Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
npm --version

# Check for errors in browser console
# Open DevTools (F12) and check Console tab
```

### Common Errors

| Error | Solution |
|-------|----------|
| `ModuleNotFoundError` | Activate venv and run `pip install -r requirements.txt` |
| `Port already in use` | Kill process: `lsof -ti:8000 | xargs kill -9` |
| `FFmpeg not found` | Install FFmpeg: `brew install ffmpeg` (macOS) |
| `Invalid API Key` | Check `.env` file has correct `GROQ_API_KEY` |
| `CORS error` | Ensure backend is running on port 8000 |

## 📊 Project Structure

```
AI Hackathon/
├── README.md                   # Main documentation
├── ARCHITECTURE.md             # System architecture
├── API_REFERENCE.md            # API documentation
├── CONTRIBUTING.md             # Contribution guide
├── CHANGELOG.md                # Version history
├── QUICK_REFERENCE.md          # This file
├── LICENSE                     # MIT License
└── synthetic_radio_host/
    ├── main.py                 # Core pipeline
    ├── server.py               # FastAPI server
    ├── evaluator.py            # AI evaluator
    ├── prompt_generator.py     # Improvement prompts
    ├── requirements.txt        # Python dependencies
    ├── .env                    # Environment variables (not in git)
    ├── .env.example            # Environment template
    └── frontend/
        ├── src/
        │   ├── App.jsx         # Main app
        │   └── components/     # React components
        ├── package.json        # Node dependencies
        └── vite.config.js      # Vite configuration
```

## 🎯 Key Files to Know

| File | Purpose |
|------|---------|
| `main.py` | Core podcast generation logic |
| `server.py` | REST API endpoints |
| `evaluator.py` | AI quality evaluation |
| `App.jsx` | Frontend main component |
| `requirements.txt` | Python dependencies |
| `package.json` | Node.js dependencies |
| `.env` | API keys and config |

## 📝 Code Snippets

### Generate Podcast (Python)

```python
import requests

response = requests.post('http://localhost:8000/api/generate', 
    json={'topic': 'Space Exploration'})
job_id = response.json()['job_id']
print(f"Job ID: {job_id}")
```

### Poll Status (JavaScript)

```javascript
async function pollStatus(jobId) {
  const response = await fetch(`http://localhost:8000/api/status/${jobId}`);
  const data = await response.json();
  console.log(`Progress: ${data.progress}%`);
  return data;
}
```

### Custom LLM Prompt

Edit `main.py`, function `generate_conversation_script()`:

```python
system_prompt = """
You are creating a Hinglish podcast...
[Customize your prompt here]
"""
```

## 🎛️ Configuration

### Voice Settings

In `main.py`:

```python
# Priya (Female)
PRIYA_VOICE = "hi-IN-SwaraNeural"
PRIYA_RATE = "+20%"  # Speech rate
PRIYA_PITCH = "+4Hz"  # Voice pitch

# Amit (Male)
AMIT_VOICE = "hi-IN-MadhurNeural"
AMIT_RATE = "+15%"
AMIT_PITCH = "-2Hz"
```

### Port Configuration

**Backend** (`server.py`):
```python
uvicorn.run(app, host="127.0.0.1", port=8000)
```

**Frontend** (`vite.config.js`):
```javascript
export default defineConfig({
  server: {
    port: 5173
  }
})
```

## 🔗 Useful Links

- **Groq Console**: https://console.groq.com
- **Edge TTS Voices**: [Microsoft TTS Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support)
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

## 📞 Getting Help

1. Check [Troubleshooting](#-debugging) section above
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) for system details
3. See [API_REFERENCE.md](API_REFERENCE.md) for endpoint details
4. Check [GitHub Issues](https://github.com/krishna-deora/Synthetic-Radio-Host/issues)
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guide

## ⚡ Quick Tips

- **Use popular topics** for best results (Cricket, Bollywood, etc.)
- **Generation takes ~30-60 seconds**
- **Check browser console** for frontend errors
- **Check terminal** for backend errors
- **Groq API is FREE** - no credit card needed
- **Test with short topics first** before complex ones

---

**Need more details?** See the full [README.md](README.md) or [ARCHITECTURE.md](ARCHITECTURE.md)
