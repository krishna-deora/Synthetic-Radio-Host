import os
import json
import asyncio
import argparse
import requests
import warnings
import re
from urllib3.exceptions import InsecureRequestWarning
from groq import Groq
import edge_tts
from dotenv import load_dotenv
from evaluator import evaluate_podcast_script, format_evaluation_summary

# Load environment variables
load_dotenv()


import httpx
import ssl

# GLOBAL SSL BYPASS (The "Nuclear" Option)
# This forces all SSL context creation to use unverified mode.
original_create_default_context = ssl.create_default_context

def patched_create_default_context(purpose=ssl.Purpose.SERVER_AUTH, *, cafile=None, capath=None, cadata=None):
    context = original_create_default_context(purpose=purpose, cafile=cafile, capath=capath, cadata=cadata)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    return context

ssl.create_default_context = patched_create_default_context


# Suppress only the single warning from urllib3 needed.
warnings.simplefilter('ignore', InsecureRequestWarning)


# Configuration
VOICE_FEMALE = "hi-IN-SwaraNeural"  # Speaker 1 (Priya)
VOICE_MALE = "hi-IN-MadhurNeural"   # Speaker 2 (Amit)
OUTPUT_DIR = "output"


class WikipediaNotFoundError(Exception):
    """Raised when a Wikipedia topic is not found."""
    pass


def fetch_wikipedia_content(topic, lang='en'):
    """Fetches the summary and content using raw Wikipedia API (bypassing SSL issues)."""
    try:
        # Fetch summary and intro
        url = f"https://{lang}.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "titles": topic,
            "prop": "extracts",
            "explaintext": True,
        }
        
        # Verify=False to bypass the SSL certificate issue on this machine
        headers = {'User-Agent': 'SyntheticRadioHost/1.0 (test@example.com)'}
        response = requests.get(url, params=params, headers=headers, verify=False)
        data = response.json()
        
        pages = data['query']['pages']
        page_id = list(pages.keys())[0]
        
        if page_id == "-1":
            raise WikipediaNotFoundError(f"Topic not found: '{topic}' is not available on Wikipedia. Please try a different topic or check the spelling.")
            
        page_data = pages[page_id]
        title = page_data.get('title', topic)
        text = page_data.get('extract', '')
        
        # Check if extract is empty (page exists but has no content)
        if not text or not text.strip():
            raise WikipediaNotFoundError(f"Topic not found: '{topic}' exists on Wikipedia but has no content. Please try a different topic.")
        
        # Structure the content
        content = f"Title: {title}\n\nContent:\n{text[:4000]}"
        return content
        
    except WikipediaNotFoundError:
        # Re-raise Wikipedia not found errors
        raise
    except Exception as e:
        print(f"Error fetching Wikipedia content: {e}")
        raise ValueError(f"Failed to fetch Wikipedia content for '{topic}': {str(e)}")


import httpx

def generate_conversation_script(topic_content, api_key):
    """Generates a Hinglish conversation script using Groq (Llama 3.3)."""
    # Create a custom HTTP client that ignores SSL errors
    http_client = httpx.Client(verify=False)
    client = Groq(api_key=api_key, http_client=http_client)
    
    system_prompt = """
You are a scriptwriter for a Hinglish podcast featuring two best friends, [Priya] and [Amit], having a casual chat like they're sitting in a chai tapri or college canteen. Write NATURAL, FLOWING Hindi-English conversation - the way real Indian friends actually talk.

HOSTS:
1. Priya (Female): Curious, expressive, asks a lot of "kyun?" and "kaise?". Uses "yaar", "pagal", "accha accha", "haan bola na".
2. Amit (Male): Knowledgeable but chill, explains things simply. Uses "dekh", "samajh", "simple hai", "pata hai na".

=== NATURAL HINGLISH STYLE (CRITICAL) ===
- Language: 70% Hindi (Roman script) + 30% English. Write like real Indians text their friends.
- Tone: Warm, friendly, like two friends gossiping about something interesting.
- Grammar: Use natural Hindi sentence structure - verb at end! "Maine dekha" not "I saw maine".
- Flow: Conversations should feel like a real back-and-forth, not a lecture.

=== AUTHENTIC INDIAN EXPRESSIONS (USE THESE!) ===
- Reactions: "Accha?", "Kya baat hai!", "Pagal hai kya", "Haan haan", "Bilkul sahi"
- Agreement: "Wahi toh", "Sahi mein", "100%", "Ekdum", "Baat toh sahi hai"
- Surprise: "Arey wah!", "Kya!", "Seriously?", "Jhooth mat bol"
- Thinking: "Hmm dekh", "Matlab kya bolu", "Ek minute", "Wait wait"
- Emphasis: "Bas yahi toh", "Poora scene yahi hai", "Yahi cheez hai"
- Casual: "Chal chhod", "Jaane de", "Koi na", "Thik hai thik hai"
- Friendly tease: "Tu bhi na", "Kuch bhi", "Haan haan pata hai tujhe sab"

=== NATURAL CONVERSATION PATTERNS ===
❌ Robotic/Formal:
A: "Aaj main aapko bataunga ki Rajasthan ke baare mein."
B: "Haan, yeh bahut interesting topic hai."

✅ Natural/Desi:
A: "Arre sun sun, tune kabhi socha Rajasthan itna bada kyun hai?"
B: "Matlab? Bada toh hai, ab isme sochne wali kya baat hai?"
A: "Arey pagal, history hai iske peeche! Suno toh..."
B: "Accha accha, bata bata."

=== CONVERSATION FLOW RULES ===
1. Interrupt each other naturally - "Arey ruk ruk, pehle yeh bata..."
2. Ask clarifying questions - "Matlab kya? Samjha nahi"  
3. React before responding - "Kya baat kar raha hai! Phir?"
4. Tease each other - "Tu bhi na, hamesha random cheezein laata hai"
5. Show genuine curiosity - "Accha phir? Aage kya hua?"
6. Agree enthusiastically - "Wahi toh! Main bhi yahi soch raha tha"

=== PACING & STRUCTURE ===
- Duration: MAX 2 MINUTES. STRICT LIMIT.
- Word Count: Max 280 words total.
- Short, punchy dialogues - like real chat.
- One person shouldn't speak too long - max 2-3 sentences at a time.
- End naturally, not abruptly - "Accha chal, baad mein aur bataunga" types.

=== OUTPUT FORMAT ===
Return JSON with "conversation" key containing 15-20 dialogue objects (Strictly max 20).
Example:
{"conversation": [
  {"speaker": "Amit", "text": "Arre yaar, tune NASA wala news dekha kya? Kuch toh interesting chal raha hai udhar."},
  {"speaker": "Priya", "text": "Haan haan, space wala? Kya hua usme?"},
  {"speaker": "Amit", "text": "Dekh, basically ek black hole discover hua hai na, woh itna massive hai ki dimaag ghoom jaaye."},
  {"speaker": "Priya", "text": "Kya baat! Kitna bada? Matlab samjha mujhe thoda."}
]}
"""
    
    user_prompt = f"Topic Content:\\n{topic_content}\\n\\nGenerate the Gen-Z Hinglish podcast script now."

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.8, # Increased temperature for more creativity/slang
        max_tokens=2500,
        response_format={"type": "json_object"}
    )
    
    try:
        response_content = completion.choices[0].message.content
        script_data = json.loads(response_content)
        script = []
        if isinstance(script_data, dict):
            for key, value in script_data.items():
                if isinstance(value, list):
                    script = value
                    break
            if not script:
                script = script_data.get("conversation", script_data.get("script", []))
        else:
            script = script_data
        
        # Ensure script is limited to ~20 segments max for < 2-minute duration
        # Average segment is ~5-6 seconds, so 20 segments ≈ 1.5 - 2 minutes
        if len(script) > 20:
            print(f"⚠️ Script has {len(script)} segments, trimming to 20 for 2-minute limit")
            script = script[:20]
        
        return script
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        return []

import random

def preprocess_text_for_tts(text):
    """Preprocess text to make TTS sound more natural and Gen-Z."""
    # The 'Haina' Rule: Replace question marks with 'haina?' occasionally if fitting (handled mostly by LLM prompt but reinforced here)
    if text.endswith("?") and random.random() < 0.3:
        text = text[:-1] + " haina?"

    # Fix "tune" pronunciation - replace Hindi pronoun "tune" with Devanagari "तूने"
    # Edge-TTS Hindi voices will correctly pronounce Devanagari script
    # Use regex to replace "tune" or "Tune" as whole words
    text = re.sub(r'\b([Tt])une\b', 'तूने', text, flags=re.IGNORECASE)

    # Fix "cheeze/cheezein" pronunciation - replace with "चीज़ / चीजें"
    text = re.sub(r'\b([Cc])heezein\b', 'चीज़ें', text, flags=re.IGNORECASE)
    text = re.sub(r'\b([Cc])heeze\b', 'चीज़ें', text, flags=re.IGNORECASE)
    text = re.sub(r'\b([Cc])heez\b', 'चीज़', text, flags=re.IGNORECASE)


    
    # Filler Injection (Randomly add start fillers)
    # Expanded variety to avoid repetition - organized by context/usage
    
    # HINGLISH FILLER WORDS - When to use:
    # - "Arre/Arrey": Surprise, emphasis, or getting attention (casual)
    # - "Yaar": Friendly address, seeking agreement (very common, use sparingly)
    # - "Bhai/Bro": Casual address, especially for guys
    # - "Matlab": Explaining or clarifying ("I mean")
    # - "Basically": Simplifying or summarizing
    # - "Sunn": Getting attention ("listen")
    # - "Accha/Achha": Realization or agreement ("oh, I see")
    # - "Toh": Emphasis or transition ("so/then")
    # - "Haina": Seeking confirmation ("right?")
    # - "Na": Seeking agreement or emphasis
    # - "Chalo": Encouraging action ("come on/let's")
    # - "You know": Assuming shared knowledge
    # - "I mean": Clarifying or emphasizing
    # - "Well": Thinking pause or transition
    # - "Like": Approximation or thinking pause
    # - "Dekho": Getting attention ("look/see")
    # - "Samjhe": Checking understanding ("understand?")
    # - "Wahi toh": Emphasizing agreement ("that's exactly it")
    # - "Ek minute": Pausing to think ("one minute")
    # - "Arey yaar": Expressing frustration or surprise
    # - "Bhai yaar": Casual emphasis
    # - "Seriously": Expressing disbelief or emphasis
    # - "Legit": Emphasizing truth ("legitimately")
    # - "Actually": Correcting or clarifying
    # - "Like that only": Emphasizing something is exactly as stated
    
    if random.random() < 0.4:
        # Expanded filler list with 25+ options to reduce repetition
        fillers = [
            # Common Hinglish (use frequently but vary)
            "Yaar, ",
            "Bhai, ",
            "Bro, ",
            "Matlab, ",
            "Basically, ",
            "Toh, ",
            
            # Attention-getters
            "Sunn, ",
            "Dekho, ",
            "Arre, ",
            "Arrey, ",
            
            # Realization/Agreement
            "Accha, ",
            "Achha, ",
            "Haina, ",
            "Na, ",
            
            # English fillers (common in Hinglish)
            "You know, ",
            "I mean, ",
            "Well, ",
            "Like, ",
            "Actually, ",
            "Seriously, ",
            
            # Action/Encouragement
            "Chalo, ",
            
            # Emphasis phrases
            "Wahi toh, ",
            "Arey yaar, ",
            "Bhai yaar, ",
            "Like that only, ",
            
            # Thinking pauses
            "Ek minute, ",
            "Samjhe, ",
        ]
        text = random.choice(fillers) + text

    # Speed overrides handled in prosody settings
    return text

async def generate_audio_segment(text, voice, filename, rate="+0%", pitch="+0Hz"):
    """Generate audio with prosody control for more natural speech."""
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(filename)

async def synthesize_podcast(script, output_file, progress_callback=None):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    temp_files = []
    total_segments = len(script)
    
    print("\nSynthesizing audio segments (Gen-Z Mode 🚀)...")
    
    # Audio synthesis represents 30-100% of overall progress (script generation is 0-30%)
    # Adjusted to move faster - audio typically completes around 73%, so we'll accelerate progress
    PROGRESS_START = 30
    PROGRESS_END = 100
    # Use a faster progress curve - front-load progress updates
    PROGRESS_ACCELERATION = 1.4  # Multiplier to make progress move faster
    
    if progress_callback:
        progress_callback(PROGRESS_START, 100, "Setting up audio synthesis...")
        await asyncio.sleep(0.1)
    
    # We will simply concatenate MP3 files using binary mode since pydub needs ffmpeg
    with open(output_file, 'wb') as final_mp3:
        for i, line in enumerate(script):
            speaker = line.get("speaker", "").lower()
            text = line.get("text", "")
            
            # Preprocess text for natural TTS
            spoken_text = preprocess_text_for_tts(text)
            
            # Gen-Z Prosody Settings: Faster, more dynamic
            # Base speed increased (~1.15x equivalent via rate percentage)
            rate_variation = random.randint(-2, 5) # Skew towards faster
            pitch_variation = random.randint(-2, 4)
            
            # Short energetic reactions should be even faster
            is_short_reaction = len(text.split()) < 5
            
            # Determine speaker and create engaging message
            if "priya" in speaker:
                voice = VOICE_FEMALE
                # Priya: Gen-Z energetic girl
                # Rate boosted to ~+20-25% for that fast pitter-patter style
                base_rate = 20 + rate_variation
                if is_short_reaction: base_rate += 10
                
                base_pitch = 4 + pitch_variation
                
                rate = f"+{base_rate}%"
                pitch = f"+{base_pitch}Hz" if base_pitch >= 0 else f"{base_pitch}Hz"
                speaker_name = "Priya"
                print(f"Priya: {text[:40]}...")
            else:
                voice = VOICE_MALE
                # Amit: Fast-paced guy
                # Rate boosted to ~+15-20%
                base_rate = 15 + rate_variation
                if is_short_reaction: base_rate += 10
                
                base_pitch = -2 + pitch_variation
                
                rate = f"+{base_rate}%"
                pitch = f"+{base_pitch}Hz" if base_pitch >= 0 else f"{base_pitch}Hz"
                speaker_name = "Amit"
                print(f"Amit:  {text[:40]}...")
            
            # Update progress before generating segment
            if progress_callback:
                segment_progress = i + 1
                # Accelerate progress - use a curve that moves faster initially
                progress_ratio = segment_progress / total_segments
                # Apply acceleration curve: faster progress early on
                accelerated_ratio = min(1.0, progress_ratio * PROGRESS_ACCELERATION)
                overall_progress = PROGRESS_START + int(accelerated_ratio * (PROGRESS_END - PROGRESS_START))
                # Ensure we don't exceed 100%
                overall_progress = min(overall_progress, 100)
                # Create dynamic, engaging messages
                messages = [
                    f"🎙️ Recording {speaker_name}'s voice...",
                    f"🎵 Synthesizing audio for {speaker_name}...",
                    f"🎬 Bringing {speaker_name}'s words to life...",
                    f"🎧 Crafting {speaker_name}'s dialogue...",
                ]
                message = messages[i % len(messages)]
                progress_callback(overall_progress, 100, message)
                await asyncio.sleep(0.02)  # Reduced delay for faster updates
            
            filename = f"{OUTPUT_DIR}/seg_{i}.mp3"
            await generate_audio_segment(spoken_text, voice, filename, rate=rate, pitch=pitch)
            temp_files.append(filename)
            
            # Simple binary concatenation for MP3
            with open(filename, 'rb') as segment_file:
                final_mp3.write(segment_file.read())
            
            # Update progress after segment is written
            if progress_callback:
                segment_progress = i + 1
                # Use same acceleration curve
                progress_ratio = segment_progress / total_segments
                accelerated_ratio = min(1.0, progress_ratio * PROGRESS_ACCELERATION)
                overall_progress = PROGRESS_START + int(accelerated_ratio * (PROGRESS_END - PROGRESS_START))
                overall_progress = min(overall_progress, 100)
                if segment_progress < total_segments:
                    progress_callback(overall_progress, 100, f"✅ {speaker_name}'s segment is ready!")
                    await asyncio.sleep(0.02)  # Reduced delay for faster updates
        
    if progress_callback:
        progress_callback(98, 100, "🎚️ Mixing final audio...")
        await asyncio.sleep(0.1)
        
    if progress_callback:
        progress_callback(99, 100, "✨ Finalizing podcast...")
        await asyncio.sleep(0.1)
        
    if progress_callback:
        progress_callback(100, 100, "🎉 Podcast ready!")
    
    print(f"\n✅ Podcast saved to {output_file}")
    
    # Cleanup
    for f in temp_files:
        if os.path.exists(f):
            os.remove(f)


async def run_podcast_generation(topic: str, progress_callback=None) -> dict:
    """
    Programmatic entry point for podcast generation.
    Returns a dictionary with output file path and evaluation results.
    
    Args:
        topic: Wikipedia topic to generate podcast about
        progress_callback: Optional callback function(current, total, message) for progress updates
    
    Returns:
        dict: {
            "output_file": str - path to generated MP3,
            "evaluation": dict - LLM critic evaluation results
        }
    """
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in .env variable")

    print(f"📻 Starting Synthetic Radio Host for: {topic}")
    
    if progress_callback:
        progress_callback(0, 100, "Initializing podcast generation...")
        await asyncio.sleep(0.1)  # Small delay to ensure update is visible
    
    if progress_callback:
        progress_callback(2, 100, "Researching topic on Wikipedia...")
    
    content = fetch_wikipedia_content(topic)
    
    if progress_callback:
        progress_callback(8, 100, "Analyzing Wikipedia content...")
        await asyncio.sleep(0.1)
        
    if progress_callback:
        progress_callback(12, 100, "Preparing script generation...")
        await asyncio.sleep(0.1)
        
    if progress_callback:
        progress_callback(15, 100, "Crafting Gen-Z Hinglish dialogue with AI...")
    
    print("📝 Generating script with Llama 3.3...")
    script = generate_conversation_script(content, api_key)
    
    if not script:
        raise ValueError("Failed to generate script from LLM.")

    # Post-processing: Deduplicate and trim
    # Remove consecutive duplicate lines if any
    filtered_script = []
    if len(script) > 0:
        filtered_script.append(script[0])
        for i in range(1, len(script)):
            if script[i].get("text") != script[i-1].get("text"):
                filtered_script.append(script[i])
    script = filtered_script

    if progress_callback:
        progress_callback(25, 100, f"Script ready! Generated {len(script)} dialogue segments.")
        await asyncio.sleep(0.1)

    # Evaluate the script using LLM critic (Mixtral 8x7B)
    if progress_callback:
        progress_callback(27, 100, "🎯 Evaluating script quality with LLM critic...")
    
    print("🎯 Evaluating script with Qwen3-32B critic...")
    evaluation = await evaluate_podcast_script(script, api_key)
    
    if evaluation and "error" not in evaluation:
        print(format_evaluation_summary(evaluation))
    else:
        print("⚠️ Evaluation completed with warnings")
    
    if progress_callback:
        progress_callback(30, 100, "Starting audio synthesis...")
        await asyncio.sleep(0.2)

    output_file = f"{OUTPUT_DIR}/{topic.replace(' ', '_').lower()}.mp3"
    await synthesize_podcast(script, output_file, progress_callback=progress_callback)
    
    return {
        "output_file": output_file,
        "evaluation": evaluation
    }

async def main():
    parser = argparse.ArgumentParser(description="Generate a synthetic Hinglish radio podcast")
    parser.add_argument("topic", help="Wikipedia topic to generate podcast about")
    args = parser.parse_args()

    result = await run_podcast_generation(args.topic)
    if not result:
        sys.exit(1)

if __name__ == "__main__":
    import sys
    asyncio.run(main())
