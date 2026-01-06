"""
Improvement Prompt Generator for Hinglish Podcast

This module generates AI-assistant-style improvement prompts using XML structure.
The prompts are designed to be used with any AI assistant (ChatGPT, Claude, Gemini, etc.)
rather than being code-specific. Uses GPT-OSS 120B for prompt generation.
"""

import json
import httpx
from groq import Groq


# Project context - conceptual description (no specific file/function names)
PROJECT_CONTEXT = """
## Project: Synthetic Radio Host - Hinglish Podcast Generator

### Core Pipeline (Conceptual):
1. **Content Fetching**: Retrieves topic information from external sources like Wikipedia
2. **Script Generation**: An LLM generates a natural Hinglish dialogue between two podcast hosts
3. **Text Preprocessing**: Adds conversational elements like filler words and fixes pronunciations for TTS
4. **Audio Synthesis**: Converts the script to speech using Indian voice models
5. **Quality Evaluation**: A separate LLM critic evaluates the podcast for naturalness

### Evaluation Categories:
- Hinglish Quality (language mixing authenticity)
- Conversational Naturalness (flow and rhythm)
- Emotional Expression (mood variations and reactions)
- Content Coherence (topic clarity and progression)
- Host Chemistry (interaction dynamics between hosts)

### Hinglish Characteristics:
- 70% Hindi (Roman script) + 30% English code-mixing
- Gen-Z friendly expressions: "yaar", "bhai", "matlab", "basically", "like"
- Natural Indian speech patterns with interruptions, reactions, and overlaps
- Two distinct host personalities:
  - Priya: Curious, expressive, asks questions, reacts enthusiastically
  - Amit: Knowledgeable, chill, explains concepts, uses humor

### Natural Conversation Elements:
- Backchannel responses: "haan haan", "accha", "sahi baat", "bilkul"
- Thinking fillers: "umm", "matlab", "basically", "you know"
- Emotional expressions: [laughs], [surprised], [excited], [thoughtful]
- Incomplete sentences and self-corrections
- Topic-relevant jokes and cultural references
"""


def generate_improvement_prompt_template(evaluation: dict) -> str:
    """Generate a detailed prompt based on evaluation results."""
    
    overall_score = evaluation.get("overall_score", 0)
    categories = evaluation.get("categories", {})
    strengths = evaluation.get("strengths", [])
    improvements = evaluation.get("improvements", [])
    feedback = evaluation.get("feedback", "")
    
    # Format category scores
    category_details = []
    for cat_key, cat_data in categories.items():
        score = cat_data.get("score", 0)
        breakdown = cat_data.get("breakdown", {})
        breakdown_str = ", ".join([f"{k}: {v}/5" for k, v in breakdown.items()])
        category_details.append(f"- {cat_key}: {score}/5.0 ({breakdown_str})")
    
    categories_text = "\n".join(category_details) if category_details else "No category data available"
    strengths_text = "\n".join([f"- {s}" for s in strengths]) if strengths else "- None identified"
    improvements_text = "\n".join([f"- {i}" for i in improvements]) if improvements else "- None identified"
    
    return f"""
Generate an AI-assistant-style improvement prompt using XML structure. The prompt should be suitable for ChatGPT, Claude, Gemini, or any AI coding assistant.

<current_evaluation>
  <overall_score>{overall_score}/5.0</overall_score>
  <category_scores>
{categories_text}
  </category_scores>
  <strengths>
{strengths_text}
  </strengths>
  <improvements_needed>
{improvements_text}
  </improvements_needed>
  <critic_feedback>{feedback}</critic_feedback>
</current_evaluation>

<project_context>
{PROJECT_CONTEXT}
</project_context>

Based on the above evaluation and project context, generate an improvement prompt with the following XML structure:

<prompt_format>
  <objective>Clear goal statement for improving the Hinglish podcast</objective>
  <context>Brief description of what the podcast system does</context>
  <current_issues>List of specific problems to address based on low-scoring categories</current_issues>
  <desired_improvements>
    <improvement priority="high/medium/low">
      <area>Category or aspect to improve</area>
      <description>What needs to change conceptually</description>
      <examples>Examples of desired vs current output</examples>
    </improvement>
  </desired_improvements>
  <constraints>
    <constraint>What to preserve or avoid breaking</constraint>
  </constraints>
  <success_criteria>How to measure if improvements worked</success_criteria>
</prompt_format>

IMPORTANT GUIDELINES:
1. DO NOT include specific file names, function names, or code references
2. Focus on WHAT to improve, not HOW to implement it in code
3. Use natural language that any AI assistant can understand
4. Include concrete examples of desired Hinglish dialogue patterns
5. Make the prompt reusable for any podcast topic
"""


async def generate_improvement_prompt(evaluation: dict, api_key: str) -> dict:
    """
    Generate a detailed improvement prompt using GPT-OSS 120B.
    
    Args:
        evaluation: Evaluation results from the critic LLM
        api_key: Groq API key
        
    Returns:
        Dictionary with the generated prompt and metadata
    """
    if not evaluation or evaluation.get("error"):
        return {
            "prompt": "Unable to generate improvement prompt: No valid evaluation data available.",
            "error": "Missing evaluation data",
            "model_used": None
        }
    
    try:
        # Create a custom HTTP client that ignores SSL errors
        http_client = httpx.Client(verify=False)
        client = Groq(api_key=api_key, http_client=http_client)
        
        user_prompt = generate_improvement_prompt_template(evaluation)
        
        system_prompt = """You are an expert prompt engineer specializing in natural language and conversational AI. Your task is to generate a well-structured, AI-assistant-compatible prompt for improving a Hinglish podcast generation system.

CRITICAL RULES:
1. DO NOT include any file names (like main.py, server.py, etc.)
2. DO NOT include any function names (like generate_script(), preprocess(), etc.)
3. DO NOT include any code snippets or implementation details
4. Focus ONLY on conceptual improvements and desired outcomes

Your output should be a SINGLE XML-structured prompt that:
1. Uses clear XML tags to organize sections (<objective>, <context>, <improvements>, <constraints>, <examples>)
2. Describes improvements in natural language that any AI assistant can understand
3. Includes specific examples of desired Hinglish dialogue patterns
4. Prioritizes improvements based on evaluation scores
5. Preserves what's working well (listed strengths)

The generated prompt should be suitable for pasting directly into ChatGPT, Claude, Gemini, or any AI coding assistant.

IMPORTANT: Output ONLY the improvement prompt itself in XML format. No thinking process, no meta-commentary, no code references."""
        
        # Use GPT-OSS 120B - OpenAI's flagship open-weight model, different from Llama 3.3 and Qwen3
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.6,  # Balanced creativity and consistency
            max_tokens=4000,
        )
        
        prompt_content = completion.choices[0].message.content
        
        # Clean up the prompt - remove any <think> tags if present
        if "<think>" in prompt_content:
            # Remove everything between <think> and </think>
            import re
            prompt_content = re.sub(r'<think>.*?</think>', '', prompt_content, flags=re.DOTALL)
            prompt_content = prompt_content.strip()
        
        return {
            "prompt": prompt_content,
            "model_used": "openai/gpt-oss-120b",
            "based_on_score": evaluation.get("overall_score", 0),
            "error": None
        }
        
    except Exception as e:
        print(f"Error generating improvement prompt: {e}")
        return {
            "prompt": f"Failed to generate improvement prompt: {str(e)}",
            "model_used": None,
            "error": str(e)
        }
