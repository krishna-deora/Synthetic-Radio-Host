# Changelog

All notable changes to the Synthetic Radio Host project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Multi-language support (beyond Hinglish)
- User authentication and podcast history
- Real-time WebSocket progress updates
- Cloud deployment support
- Custom voice selection
- Podcast sharing functionality

---

## [1.2.0] - 2026-01-06

### Added
- **Topic Autocomplete**: Wikipedia-powered topic suggestions with keyboard navigation
- **Improved UI**: Enhanced glassmorphism design with better visual hierarchy
- **Comprehensive Documentation**:
  - Added `ARCHITECTURE.md` for system design details
  - Added `API_REFERENCE.md` for complete API documentation
  - Added `CONTRIBUTING.md` for contributor guidelines
  - Updated `README.md` with better structure and badges

### Changed
- Reorganized project documentation for better clarity
- Enhanced README with collapsible sections and visual improvements
- Improved error messages for better debugging

### Fixed
- Fixed autocomplete dropdown positioning issues
- Improved mobile responsiveness

---

## [1.1.0] - 2026-01-01

### Added
- **AI Evaluation System**: Mixtral 8x7B critic evaluates podcast quality
  - 5-category scoring system (Hinglish Quality, Conversational Naturalness, etc.)
  - Weighted overall score calculation
  - Detailed strengths and areas for improvement
- **Improvement Prompt Generator**: DeepSeek R1 generates actionable improvement prompts
  - AI-IDE ready format
  - Focus on low-scoring categories
  - Generic and reusable prompts
- **EvaluationScoreCard Component**: Visual display of evaluation results
- **ImprovementPromptCard Component**: Copy-to-clipboard functionality for prompts

### Changed
- Updated pipeline to include evaluation and prompt generation stages
- Enhanced progress tracking to include evaluation stages (95-100%)
- Improved backend job structure to include evaluation data

### Fixed
- None

---

## [1.0.0] - 2025-12-31

### Added
- **Filler Word Optimization**: Enhanced LLM prompt with detailed filler usage guidelines
  - Max one filler per sentence rule
  - Context-appropriate filler mapping
  - Placement rules (beginning, end, not middle)
  - Wrong vs Right examples
- **Stricter Evaluation**: Enhanced filler words usage scoring rubric
- **Updated Prompt Generator**: Reflects correct filler usage in improvement prompts

### Changed
- **Removed Automatic Filler Injection**: Filler control now entirely managed by LLM prompt
  - Deleted 40% probability filler injection from `preprocess_text_for_tts()`
  - Deleted 25+ filler word list
  - Kept only necessary pronunciation fixes
- Reduced "haina?" replacement probability from 30% to 20%

### Fixed
- **Major Bug Fix**: Eliminated double filler injection problem
  - Previously: Fillers added in both LLM generation and post-processing
  - Now: Single source of truth (LLM prompt)
  - Result: More natural conversations without excessive fillers

### Documentation
- Added `FILLER_WORD_FIX_SUMMARY.md` (internal development note)
- Updated `HINGLISH_FILLER_WORDS_GUIDE.md` with context-appropriate usage
- Enhanced `PROJECT_DOCUMENTATION.md` with filler usage details

---

## [0.9.0] - 2025-12-31

### Added
- **Emotional Tone Markers**: Added support for `[laughs]`, `[playful]`, `[excited]`, `[thoughtful]` in scripts
- **Enhanced Voice Prosody**:
  - Priya: +20-25% speech rate, +4Hz pitch
  - Amit: +15-20% speech rate, -2Hz pitch
  - Dynamic rate adjustments for short reactions (+10% boost)
- **Progress Tracking**: Real-time progress updates with stage-wise reporting
  - Wikipedia Fetch: 0-8%
  - Script Generation: 8-30%
  - Audio Synthesis: 30-100%

### Changed
- Improved LLM prompt to request emotional variety
- Enhanced dialogue naturalness with reactive logic
- Better speaker assignment for audio segments

### Fixed
- Fixed pronunciation issues with Hindi words (tune → तूने)
- Fixed phonetic adjustments for proper names (Rajasthan → Raajas-thaan)

---

## [0.8.0] - 2025-12-31

### Added
- **Hinglish Filler Words**: Comprehensive system with 25+ filler options
  - Common: Yaar, Bhai, Bro
  - Attention: Sunn, Dekho, Arre
  - Agreement: Haina, Na, Accha
  - English: You know, I mean, Well
  - Emphasis: Wahi toh, Seriously, Legit
- **Context-Appropriate Filler Selection**: Fillers mapped to dialogue context
- **Filler Usage Guidelines**: Created `HINGLISH_FILLER_WORDS_GUIDE.md`

### Changed
- Updated LLM prompt to encourage natural filler variety
- Improved dialogue flow with better filler placement

---

## [0.7.0] - 2025-12-31

### Added
- **Modern Web UI**: React-based frontend with Vite
  - Glassmorphism design aesthetic
  - Real-time progress tracking with fun facts
  - Audio player with speed control (1x-4x)
  - Download functionality
- **FastAPI Backend**: REST API server
  - `/api/generate`: Start podcast generation
  - `/api/status/:job_id`: Get job status and progress
  - `/api/download/:filename`: Download MP3 file
- **Background Task Processing**: Asynchronous podcast generation

### Changed
- Separated backend (FastAPI) and frontend (React)
- Implemented job-based architecture with progress callbacks

---

## [0.6.0] - 2025-12-30

### Added
- **Dual Voice System**: Two distinct AI host personalities
  - RJ Priya: Female voice (hi-IN-SwaraNeural), energetic, Gen-Z
  - RJ Amit: Male voice (hi-IN-MadhurNeural), witty, sarcastic
- **Edge TTS Integration**: Microsoft Edge TTS for high-quality audio synthesis
- **Binary MP3 Concatenation**: Efficient audio merging without external dependencies

### Changed
- Upgraded from single voice to dual-host format
- Improved audio quality with better prosody settings

---

## [0.5.0] - 2025-12-29

### Added
- **Wikipedia Integration**: Automatic content fetching from Wikipedia API
- **Error Handling**: Graceful handling of missing topics and API failures
- **Structured JSON Output**: LLM generates JSON conversation format

### Changed
- Improved prompt engineering for better Hinglish generation
- Enhanced error messages for user feedback

---

## [0.4.0] - 2025-12-28

### Added
- **Groq API Integration**: Llama 3.3 70B for script generation
- **Gen-Z Hinglish Style**: 70% Hindi (Roman) + 30% English
- **Conversational Format**: Dialogue-based podcast structure

### Changed
- Migrated from basic text generation to conversational format
- Improved prompt to request Gen-Z tone and slang

---

## [0.3.0] - 2025-12-27

### Added
- **Basic TTS**: Initial text-to-speech implementation
- **Audio Output**: MP3 file generation

---

## [0.2.0] - 2025-12-26

### Added
- **Jupyter Notebook**: Interactive development environment
- **Basic LLM Integration**: Initial Groq API setup

---

## [0.1.0] - 2025-12-25

### Added
- Initial project setup
- Basic Python environment
- Project structure foundation

---

## Version Summary

| Version | Date | Key Feature |
|---------|------|-------------|
| 1.2.0 | 2026-01-06 | Topic autocomplete, comprehensive documentation |
| 1.1.0 | 2026-01-01 | AI evaluation system, improvement prompts |
| 1.0.0 | 2025-12-31 | Filler word optimization, removed double injection |
| 0.9.0 | 2025-12-31 | Emotional tones, enhanced prosody |
| 0.8.0 | 2025-12-31 | 25+ Hinglish fillers, context mapping |
| 0.7.0 | 2025-12-31 | Modern web UI, FastAPI backend |
| 0.6.0 | 2025-12-30 | Dual voice system, Edge TTS |
| 0.5.0 | 2025-12-29 | Wikipedia integration |
| 0.4.0 | 2025-12-28 | Groq API, Gen-Z Hinglish |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this project.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
