import asyncio
import uuid
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
from pydantic import BaseModel
from typing import Dict, Optional

# Import the core logic from main.py
# We need to ensure main.py code is accessible. 
# Since they are in the same directory, this import works.
from main import run_podcast_generation, OUTPUT_DIR, WikipediaNotFoundError
from prompt_generator import generate_improvement_prompt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Job Management ---
# In-memory storage for job status
# Structure: { job_id: { "status": "processing" | "completed" | "failed", "filename": str | None, "message": str } }
JOBS: Dict[str, Dict] = {}

class GenerateRequest(BaseModel):
    topic: str

app = FastAPI(title="Synthetic Radio Host API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def progress_callback_factory(job_id: str):
    """Factory function to create a progress callback that updates job status."""
    def progress_callback(current: int, total: int, message: str):
        progress_percent = int((current / total) * 100) if total > 0 else 0
        # Ensure progress is within valid range
        progress_percent = max(0, min(100, progress_percent))
        
        # Update job status atomically
        if job_id in JOBS:
            JOBS[job_id]["progress"] = progress_percent
            JOBS[job_id]["message"] = message
            # Ensure status remains "processing" during updates
            if JOBS[job_id]["status"] == "pending":
                JOBS[job_id]["status"] = "processing"
            print(f"Job {job_id}: {progress_percent}% - {message}")
    return progress_callback

async def processing_task(job_id: str, topic: str):
    """Background task to run the generation process."""
    try:
        JOBS[job_id]["status"] = "processing"
        JOBS[job_id]["message"] = "Starting generation..."
        JOBS[job_id]["progress"] = 0
        
        # Create progress callback to update job status
        progress_cb = progress_callback_factory(job_id)
        
        # This function handles the whole pipeline and returns dict with output_file and evaluation
        result = await run_podcast_generation(topic, progress_callback=progress_cb)
        
        if result and result.get("output_file") and os.path.exists(result["output_file"]):
            JOBS[job_id]["status"] = "completed"
            JOBS[job_id]["message"] = "Podcast ready!"
            JOBS[job_id]["progress"] = 100
            JOBS[job_id]["filename"] = os.path.basename(result["output_file"])
            # Include evaluation results in job data
            evaluation = result.get("evaluation", {})
            JOBS[job_id]["evaluation"] = evaluation
            
            # Generate improvement prompt using DeepSeek R1
            api_key = os.getenv("GROQ_API_KEY")
            if api_key and evaluation and not evaluation.get("error"):
                try:
                    print("🚀 Generating improvement prompt with DeepSeek R1...")
                    improvement_result = await generate_improvement_prompt(evaluation, api_key)
                    JOBS[job_id]["improvement_prompt"] = improvement_result
                    print("✅ Improvement prompt generated successfully")
                except Exception as e:
                    print(f"⚠️ Failed to generate improvement prompt: {e}")
                    JOBS[job_id]["improvement_prompt"] = {"error": str(e)}
        else:
            JOBS[job_id]["status"] = "failed"
            JOBS[job_id]["message"] = "Generation returned no output."
            
    except WikipediaNotFoundError as e:
        print(f"Job {job_id} failed: {e}")
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["message"] = str(e)  # Use the clean error message from the exception
    except Exception as e:
        print(f"Job {job_id} failed: {e}")
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["message"] = f"Error: {str(e)}"

@app.post("/api/generate")
async def generate_podcast(req: GenerateRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {
        "status": "pending",
        "topic": req.topic,
        "message": "Queued",
        "filename": None,
        "progress": 0,
        "evaluation": None,  # Will be populated after script evaluation
        "improvement_prompt": None  # Will be populated after improvement prompt generation
    }
    
    background_tasks.add_task(processing_task, job_id, req.topic)
    
    return {"job_id": job_id, "status": "pending"}

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JOBS[job_id]

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path, media_type="audio/mpeg", filename=filename)

@app.get("/api/wikipedia/suggest")
async def get_wikipedia_suggestions(query: str):
    """
    Proxies requests to Wikipedia's OpenSearch API for autocomplete suggestions.
    """
    if not query or len(query.strip()) < 2:
        return {"suggestions": []}
        
    try:
        # Wikipedia OpenSearch API
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "opensearch",
            "search": query,
            "limit": 7,
            "namespace": 0,
            "format": "json"
        }
        
        # Use a proper User-Agent as requested by Wikipedia
        headers = {'User-Agent': 'SyntheticRadioHost/1.0 (test@example.com)'}
        
        # Use httpx for async request (we need to import it first, but requests is already used in main.py)
        # For simplicity in this existing sync/async mix, we'll use requests but wrapping it 
        # normally we should use httpx.AsyncClient, but let's stick to what's available
        # Actually, let's use requests with verify=False consistent with main.py "nuclear option"
        resp = requests.get(url, params=params, headers=headers, verify=False)
        
        if resp.status_code == 200:
            data = resp.json()
            # OpenSearch returns [query, [titles], [descriptions], [urls]]
            # We just want the titles
            if len(data) > 1:
                return {"suggestions": data[1]}
            return {"suggestions": []}
        else:
            print(f"Wikipedia API error: {resp.status_code}")
            return {"suggestions": []}
            
    except Exception as e:
        print(f"Error fetching suggestions: {e}")
        return {"suggestions": []}


if __name__ == "__main__":
    import uvicorn
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Get port from environment variable (required for Render)
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
