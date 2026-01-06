# 📡 API Reference

Complete API documentation for the Synthetic Radio Host backend server.

## Base URL

```
http://localhost:8000
```

---

## Endpoints

### 1. Generate Podcast

Start a new podcast generation job.

**Endpoint**: `POST /api/generate`

**Request Body**:
```json
{
  "topic": "string"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | Yes | Wikipedia topic to generate podcast about |

**Response** (200 OK):
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Podcast generation started"
}
```

**Error Responses**:

| Code | Description | Response |
|------|-------------|----------|
| 400 | Missing topic | `{"detail": "Topic is required"}` |
| 500 | Server error | `{"detail": "Internal server error"}` |

**Example**:
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Artificial Intelligence"}'
```

---

### 2. Get Job Status

Retrieve the current status and progress of a generation job.

**Endpoint**: `GET /api/status/{job_id}`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `job_id` | string (UUID) | Job identifier from generate endpoint |

**Response** (200 OK):

**Pending/Processing**:
```json
{
  "status": "processing",
  "progress": 45,
  "message": "Generating audio segments...",
  "filename": null,
  "evaluation": null,
  "improvement_prompt": null
}
```

**Completed**:
```json
{
  "status": "completed",
  "progress": 100,
  "message": "Podcast generated successfully!",
  "filename": "podcast_artificial_intelligence_20260106_144530.mp3",
  "evaluation": {
    "overall_score": 4.2,
    "score_label": "Great",
    "categories": {
      "hinglish_quality": {
        "score": 4.0,
        "feedback": "Good code-mixing with natural flow"
      },
      "conversational_naturalness": {
        "score": 4.5,
        "feedback": "Excellent dialogue transitions and reactions"
      },
      "emotional_expression": {
        "score": 4.0,
        "feedback": "Good variety of emotions"
      },
      "content_coherence": {
        "score": 4.5,
        "feedback": "Clear topic progression"
      },
      "host_chemistry": {
        "score": 4.0,
        "feedback": "Good interaction between hosts"
      }
    },
    "strengths": [
      "Natural conversation flow",
      "Good host chemistry",
      "Appropriate filler word usage"
    ],
    "areas_for_improvement": [
      "Could use more emotional variety",
      "Some segments feel slightly scripted"
    ],
    "specific_suggestions": [
      "Add more spontaneous reactions",
      "Include more laughter moments"
    ]
  },
  "improvement_prompt": {
    "prompt": "Detailed AI-IDE ready prompt...",
    "metadata": {
      "focus_areas": ["emotional_expression"],
      "target_score": 4.5,
      "model_used": "deepseek-r1-distill-llama-70b"
    }
  }
}
```

**Failed**:
```json
{
  "status": "failed",
  "progress": 15,
  "message": "Wikipedia article not found for topic 'XYZ'",
  "filename": null,
  "evaluation": null,
  "improvement_prompt": null
}
```

**Error Responses**:

| Code | Description | Response |
|------|-------------|----------|
| 404 | Job not found | `{"detail": "Job not found"}` |

**Example**:
```bash
curl http://localhost:8000/api/status/550e8400-e29b-41d4-a716-446655440000
```

---

### 3. Download Podcast

Download the generated MP3 file.

**Endpoint**: `GET /api/download/{filename}`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `filename` | string | Filename from status endpoint |

**Response** (200 OK):
- **Content-Type**: `audio/mpeg`
- **Body**: MP3 file binary data

**Error Responses**:

| Code | Description | Response |
|------|-------------|----------|
| 404 | File not found | `{"detail": "File not found"}` |

**Example**:
```bash
curl -O http://localhost:8000/api/download/podcast_artificial_intelligence_20260106_144530.mp3
```

**Browser**:
```
http://localhost:8000/api/download/podcast_artificial_intelligence_20260106_144530.mp3
```

---

### 4. Wikipedia Topic Suggestions

Get autocomplete suggestions for Wikipedia topics.

**Endpoint**: `GET /api/wikipedia/suggest`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (min 2 characters) |

**Response** (200 OK):
```json
{
  "suggestions": [
    "Artificial Intelligence",
    "Artificial Intelligence in Healthcare",
    "Artificial General Intelligence",
    "Artificial Neural Network"
  ]
}
```

**Error Responses**:

| Code | Description | Response |
|------|-------------|----------|
| 400 | Missing query | `{"detail": "Query parameter is required"}` |
| 500 | Wikipedia API error | `{"detail": "Failed to fetch suggestions"}` |

**Example**:
```bash
curl "http://localhost:8000/api/wikipedia/suggest?query=space"
```

---

## Data Models

### Job Status

```typescript
type JobStatus = "pending" | "processing" | "completed" | "failed";

interface Job {
  status: JobStatus;
  progress: number;          // 0-100
  message: string;
  filename: string | null;
  evaluation: Evaluation | null;
  improvement_prompt: ImprovementPrompt | null;
}
```

### Evaluation

```typescript
interface CategoryScore {
  score: number;             // 1-5
  feedback: string;
}

interface Evaluation {
  overall_score: number;     // 1-5
  score_label: string;       // "Excellent" | "Great" | "Good" | "Needs Work" | "Poor"
  categories: {
    hinglish_quality: CategoryScore;
    conversational_naturalness: CategoryScore;
    emotional_expression: CategoryScore;
    content_coherence: CategoryScore;
    host_chemistry: CategoryScore;
  };
  strengths: string[];
  areas_for_improvement: string[];
  specific_suggestions: string[];
}
```

### Improvement Prompt

```typescript
interface ImprovementPrompt {
  prompt: string;            // Detailed AI-IDE prompt
  metadata: {
    focus_areas: string[];   // Low-scoring categories
    target_score: number;    // Target overall score
    model_used: string;      // LLM model identifier
  };
}
```

---

## Progress Tracking

The generation process has distinct stages with progress ranges:

| Stage | Progress Range | Description |
|-------|----------------|-------------|
| **Wikipedia Fetch** | 0-8% | Fetching article content |
| **Script Generation** | 8-30% | LLM generating conversation script |
| **Audio Synthesis** | 30-95% | TTS generating audio segments |
| **Evaluation** | 95-98% | AI evaluating podcast quality |
| **Improvement** | 98-100% | Generating improvement suggestions |

**Progress Updates**:
- Frontend should poll `/api/status` every **1 second**
- Backend updates progress in real-time via callback
- Smooth transitions between stages

---

## Error Handling

### Common Error Scenarios

1. **Wikipedia Topic Not Found**
   ```json
   {
     "status": "failed",
     "message": "Wikipedia article not found for topic 'NonExistentTopic'"
   }
   ```

2. **API Key Invalid**
   ```json
   {
     "status": "failed",
     "message": "Groq API authentication failed"
   }
   ```

3. **TTS Generation Failed**
   ```json
   {
     "status": "failed",
     "message": "Failed to generate audio: TTS service unavailable"
   }
   ```

4. **Empty Script**
   ```json
   {
     "status": "failed",
     "message": "Failed to generate conversation script"
   }
   ```

### Error Response Format

All errors follow this structure:
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Rate Limiting

**Current Implementation**: No rate limiting

**Recommendations for Production**:
- Limit to **10 requests per minute** per IP
- Queue jobs to prevent resource exhaustion
- Implement API key-based authentication

---

## CORS Configuration

**Current**: Allows all origins (`*`)

**Headers**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Production Recommendation**:
```python
origins = [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

---

## Authentication

**Current**: None

**Future Considerations**:
- API key in header: `X-API-Key: your_key_here`
- JWT tokens for user sessions
- OAuth2 for third-party integrations

---

## WebSocket Support

**Status**: Not implemented

**Potential Use Case**: Real-time progress updates instead of polling

**Example Implementation**:
```python
@app.websocket("/ws/status/{job_id}")
async def websocket_status(websocket: WebSocket, job_id: str):
    await websocket.accept()
    while True:
        status = get_job_status(job_id)
        await websocket.send_json(status)
        if status["status"] in ["completed", "failed"]:
            break
        await asyncio.sleep(1)
```

---

## Examples

### Complete Workflow (Python)

```python
import requests
import time

BASE_URL = "http://localhost:8000"

# 1. Start generation
response = requests.post(f"{BASE_URL}/api/generate", json={
    "topic": "Quantum Computing"
})
job_data = response.json()
job_id = job_data["job_id"]

print(f"Job started: {job_id}")

# 2. Poll for status
while True:
    response = requests.get(f"{BASE_URL}/api/status/{job_id}")
    status = response.json()
    
    print(f"Progress: {status['progress']}% - {status['message']}")
    
    if status["status"] == "completed":
        filename = status["filename"]
        print(f"Completed! Filename: {filename}")
        
        # Show evaluation
        eval_data = status["evaluation"]
        print(f"Score: {eval_data['overall_score']}/5.0")
        print(f"Strengths: {', '.join(eval_data['strengths'])}")
        
        break
    elif status["status"] == "failed":
        print(f"Failed: {status['message']}")
        break
    
    time.sleep(1)

# 3. Download podcast
if status["status"] == "completed":
    response = requests.get(f"{BASE_URL}/api/download/{filename}")
    with open(filename, "wb") as f:
        f.write(response.content)
    print(f"Downloaded: {filename}")
```

### Complete Workflow (JavaScript)

```javascript
const BASE_URL = 'http://localhost:8000';

async function generatePodcast(topic) {
  // 1. Start generation
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  
  const { job_id } = await response.json();
  console.log(`Job started: ${job_id}`);
  
  // 2. Poll for status
  while (true) {
    const statusResponse = await fetch(`${BASE_URL}/api/status/${job_id}`);
    const status = await statusResponse.json();
    
    console.log(`Progress: ${status.progress}% - ${status.message}`);
    
    if (status.status === 'completed') {
      console.log(`Completed! Filename: ${status.filename}`);
      console.log(`Score: ${status.evaluation.overall_score}/5.0`);
      return status;
    } else if (status.status === 'failed') {
      throw new Error(status.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Usage
generatePodcast('Blockchain Technology')
  .then(result => console.log('Podcast ready!', result))
  .catch(error => console.error('Failed:', error));
```

---

## Performance Considerations

### Response Times

| Endpoint | Typical Response Time |
|----------|----------------------|
| POST /api/generate | <100ms (immediate) |
| GET /api/status | <50ms |
| GET /api/download | Varies by file size (~2-5MB) |
| GET /api/wikipedia/suggest | 200-500ms |

### Optimization Tips

1. **Enable HTTP/2** for faster streaming
2. **Implement caching** for Wikipedia suggestions
3. **Use CDN** for podcast file delivery
4. **Compress responses** with gzip
5. **Implement pagination** if adding history feature

---

## Versioning

**Current Version**: v1 (implicit)

**Future Versioning**:
```
/api/v1/generate
/api/v2/generate
```

---

**For implementation details, see**: [Architecture Documentation](ARCHITECTURE.md)
