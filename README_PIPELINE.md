# Autonomous Video Production Pipeline

Python-based end-to-end video production pipeline that transforms a topic/idea into ready-to-post videos for TikTok, YouTube Shorts, and Instagram Reels.

## Architecture

```
main.py                        ← CLI entry point & orchestrator
├── config.json                ← All settings (LLM, TTS, video gen, music, export)
├── requirements.txt           ← Python dependencies
├── modules/
│   ├── script_generator.py    ← LLM script generation (OpenAI/Groq/Ollama + fallback)
│   ├── tts_generator.py       ← Voiceover (XTTS v2 + Edge-TTS + gTTS fallback)
│   ├── video_generator.py     ← Video clips (ComfyUI / HunyuanVideo / FFmpeg procedural)
│   ├── music_generator.py     ← Background music (MusicGen / Audiocraft / FFmpeg synth)
│   ├── subtitle_generator.py  ← Subtitles (Whisper / faster-whisper → SRT + ASS)
│   ├── editor.py              ← Assembly (concat, audio ducking, transitions, burn-in)
│   └── exporter.py            ← Multi-aspect export (9:16, 16:9 @ 1080p/4K)
├── templates/
│   └── comfyui_txt2vid_workflow.json
├── output/                    ← Final exported .mp4 files
└── temp/                      ← Intermediate files (auto-cleaned)
```

## Pipeline Stages

| Stage | Module | Function |
|-------|--------|----------|
| 1 | `script_generator.py` | LLM generates scene-by-scene script with visual prompts |
| 2 | `tts_generator.py` | Voiceover narration (Arabic + multilingual) |
| 3 | `video_generator.py` | AI video clips per scene from visual prompts |
| 4 | `music_generator.py` | Matching background music track |
| 5 | `subtitle_generator.py` | Whisper transcription → styled SRT/ASS subtitles |
| 6 | `editor.py` | Concatenate, mix audio, apply transitions, burn subtitles |
| 7 | `exporter.py` | Scale/crop into all target aspect ratios & resolutions |

## Prerequisites

- **Python 3.10+**
- **FFmpeg** installed and on PATH (`ffmpeg -version`)
- **GPU** recommended for XTTS v2, MusicGen, Whisper (CPU fallback available)
- An LLM API key (OpenAI, Groq, etc.) or local Ollama instance

## Installation

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Install FFmpeg (if not already)
winget install ffmpeg        # Windows
# sudo apt install ffmpeg    # Linux
# brew install ffmpeg        # macOS

# 4. Set LLM API key
set OPENAI_API_KEY=sk-...    # Windows
# export OPENAI_API_KEY=sk-...  # Linux/Mac
```

## Usage

### Minimal (Arabic default)

```bash
python main.py "قانون العمال في مصر"
```

### Named arguments

```bash
python main.py --topic "Business Law 101" --lang en --duration 45
```

### With specific config

```bash
python main.py --config my_config.json "Tax Law Basics"
```

### Export only one format

```bash
python main.py --topic "AI Trends 2026" --export vertical_1080p
```

### Keep temp files for debugging

```bash
python main.py --keep-temp "قانون العمال"
```

## Configuration (config.json)

### LLM Provider

```json
"llm": {
  "provider": "openai",       // "openai" | "groq" | "ollama" | "custom"
  "model": "gpt-4o-mini",
  "api_key_env": "OPENAI_API_KEY",
  "base_url": "https://api.openai.com/v1",
  "ollama_host": "http://localhost:11434"
}
```

### TTS Engine

```json
"tts": {
  "engine": "xtts_v2",        // "xtts_v2" | "edge_tts" | "gtts"
  "language": "ar",
  "speaker_wav": "assets/speaker_reference.wav",
  "fallback_engine": "edge_tts"
}
```

### Video Generation

```json
"video_gen": {
  "engine": "comfyui",        // "comfyui" | "hunyuan"
  "comfyui_url": "http://127.0.0.1:8188",
  "fallback_to_procedural": true
}
```

### Music Generation

```json
"music_gen": {
  "engine": "musicgen",       // "musicgen" (Audiocraft) or fallback to procedural
  "model_name": "facebook/musicgen-small",
  "fallback_to_procedural": true
}
```

### Export Formats

```json
"export": {
  "formats": [
    {"name": "vertical_1080p",  "width": 1080, "height": 1920, "platform": "TikTok/Reels"},
    {"name": "vertical_4k",     "width": 2160, "height": 3840, "platform": "TikTok 4K"},
    {"name": "horizontal_1080p","width": 1920, "height": 1080, "platform": "YouTube"},
    {"name": "horizontal_4k",   "width": 3840, "height": 2160, "platform": "YouTube 4K"}
  ]
}
```

## Output Files

After running, you'll find in `output/`:

```
output/
├── قانون_العمال_في_مصر_vertical_1080p.mp4    ← 1080×1920 (TikTok/Reels/Shorts)
├── قانون_العمال_في_مصر_vertical_4k.mp4       ← 2160×3840 (TikTok 4K)
├── قانون_العمال_في_مصر_horizontal_1080p.mp4  ← 1920×1080 (YouTube)
└── قانون_العمال_في_مصر_horizontal_4k.mp4     ← 3840×2160 (YouTube 4K)
```

## Fallback Chain

Every module has a graceful fallback chain. If the primary AI service is unavailable, the pipeline continues with alternative methods:

| Module | Primary → Fallback |
|--------|-------------------|
| Script | OpenAI/Groq API → Ollama → Local template |
| TTS | XTTS v2 → Edge-TTS (neural) → gTTS |
| Video | ComfyUI → HunyuanVideo → FFmpeg procedural |
| Music | Audiocraft MusicGen → HuggingFace Transformers → FFmpeg ambient synth |
| Subtitles | Whisper → faster-whisper → Script-based timing |

## Platform Requirements

| Platform | Aspect Ratio | Resolution | FPS |
|----------|-------------|------------|-----|
| TikTok | 9:16 | 1080×1920 | 30 |
| YouTube Shorts | 9:16 | 1080×1920 | 30 |
| Instagram Reels | 9:16 | 1080×1920 | 30 |
| YouTube | 16:9 | 1920×1080 | 30 |
| YouTube 4K | 16:9 | 3840×2160 | 30 |

## Troubleshooting

**FFmpeg not found:**
```bash
ffmpeg -version   # Should show version info
```

**XTTS v2 out of memory:**
- Set `tts.engine: "edge_tts"` in config.json for cloud-based fallback

**ComfyUI connection refused:**
- Ensure ComfyUI is running on `http://127.0.0.1:8188`
- Set `video_gen.fallback_to_procedural: true` for offline mode

**Whisper model download slow:**
- Set `subtitles.model_size: "base"` for faster initial download
- Or set `subtitles.model_size: "large-v3"` for best accuracy

**API key errors:**
```bash
echo $OPENAI_API_KEY   # Verify key is set
```
