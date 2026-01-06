"""
LLM Critic Judge for Hinglish Podcast Evaluation

This module provides evaluation capabilities for generated podcast scripts
using Mixtral 8x7B as the judge LLM (different from Llama 3.3 used for generation).
"""

import json
import httpx
from groq import Groq


# Evaluation weights for each category (must sum to 1.0)
CATEGORY_WEIGHTS = {
    "hinglish_quality": 0.25,
    "conversational_naturalness": 0.30,
    "emotional_expression": 0.20,
    "content_coherence": 0.15,
    "host_chemistry": 0.10
}


def generate_evaluation_prompt(script: list) -> str:
    """Generate the evaluation prompt with the podcast script."""
    
    # Format script for evaluation
    formatted_script = "\n".join([
        f"{line.get('speaker', 'Unknown')}: {line.get('text', '')}"
        for line in script
    ])
    
    return f"""Evaluate the following Hinglish podcast conversation script. 
This is a conversation between two hosts, Priya (female) and Amit (male), discussing a topic in a casual, Gen-Z friendly Hinglish style.

=== PODCAST SCRIPT ===
{formatted_script}
=== END SCRIPT ===

Rate this podcast on the following criteria. For each parameter, give a score from 1-5:
- 1: Poor/Robotic
- 2: Below Average
- 3: Acceptable
- 4: Good/Natural
- 5: Excellent/Indistinguishable from human

=== EVALUATION CATEGORIES ===

**Category 1: Hinglish Linguistic Quality**
1. code_mixing_naturalness: How naturally Hindi and English are blended, context-aware switching
2. cultural_appropriateness: Reflects Gen-Z Indian communication patterns, uses authentic expressions
3. romanized_hindi_fluency: Proper handling of romanized Hindi, natural spelling

**Category 2: Conversational Naturalness**
4. human_likeness: Sounds like real humans talking, avoids robotic/formal tone
5. natural_imperfections: Includes natural speech patterns like "ums", "hmms", self-corrections
6. filler_words_usage: Appropriate use of "yaar", "bhai", "like", "basically", etc.
7. turn_taking_flow: Natural back-and-forth, hosts respond to each other, not monologues

**Category 3: Emotional & Prosodic Quality**
8. emotional_variation: Expresses excitement, humor, curiosity, surprise appropriately
9. pacing_markers: Natural pauses, emphasis markers, varied sentence lengths

**Category 4: Content & Coherence**
10. topic_coherence: Stays on topic while allowing natural tangents
11. information_accuracy: Content seems factually reasonable
12. avoids_ai_telltales: No repetitive phrases, over-formality, or typical AI patterns

**Category 5: Host Chemistry**
13. distinct_personalities: Each host has unique voice/style
14. playful_banter: Teasing, jokes, friendly interactions

=== OUTPUT FORMAT ===
Return a JSON object with this EXACT structure:
{{
  "scores": {{
    "hinglish_quality": {{
      "code_mixing_naturalness": <1-5>,
      "cultural_appropriateness": <1-5>,
      "romanized_hindi_fluency": <1-5>
    }},
    "conversational_naturalness": {{
      "human_likeness": <1-5>,
      "natural_imperfections": <1-5>,
      "filler_words_usage": <1-5>,
      "turn_taking_flow": <1-5>
    }},
    "emotional_expression": {{
      "emotional_variation": <1-5>,
      "pacing_markers": <1-5>
    }},
    "content_coherence": {{
      "topic_coherence": <1-5>,
      "information_accuracy": <1-5>,
      "avoids_ai_telltales": <1-5>
    }},
    "host_chemistry": {{
      "distinct_personalities": <1-5>,
      "playful_banter": <1-5>
    }}
  }},
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "feedback": "A 2-3 sentence overall feedback about the conversation quality."
}}

Be specific and constructive in your feedback. Focus on what makes this conversation feel natural or unnatural for a Hinglish podcast."""


def calculate_category_score(breakdown: dict) -> float:
    """Calculate average score for a category from its breakdown."""
    if not breakdown:
        return 0.0
    scores = list(breakdown.values())
    return round(sum(scores) / len(scores), 2)


def calculate_overall_score(categories: dict) -> float:
    """Calculate weighted overall score from category scores."""
    total = 0.0
    for category, weight in CATEGORY_WEIGHTS.items():
        category_data = categories.get(category, {})
        category_score = category_data.get("score", 0)
        total += category_score * weight
    return round(total, 2)


def parse_evaluation_response(response_content: str) -> dict:
    """Parse the LLM evaluation response into structured format."""
    try:
        data = json.loads(response_content)
        
        # Structure the results
        categories = {}
        scores = data.get("scores", {})
        
        for category_name in CATEGORY_WEIGHTS.keys():
            breakdown = scores.get(category_name, {})
            category_score = calculate_category_score(breakdown)
            categories[category_name] = {
                "score": category_score,
                "breakdown": breakdown
            }
        
        overall_score = calculate_overall_score(categories)
        
        return {
            "overall_score": overall_score,
            "categories": categories,
            "strengths": data.get("strengths", []),
            "improvements": data.get("improvements", []),
            "feedback": data.get("feedback", "No feedback provided.")
        }
        
    except json.JSONDecodeError as e:
        print(f"Error parsing evaluation response: {e}")
        return {
            "overall_score": 0,
            "categories": {},
            "strengths": [],
            "improvements": [],
            "feedback": "Failed to parse evaluation response.",
            "error": str(e)
        }


async def evaluate_podcast_script(script: list, api_key: str) -> dict:
    """
    Evaluate a podcast script using Mixtral 8x7B as the critic judge.
    
    Args:
        script: List of dialogue objects with 'speaker' and 'text' keys
        api_key: Groq API key
        
    Returns:
        Dictionary with evaluation results including scores and feedback
    """
    if not script or len(script) == 0:
        return {
            "overall_score": 0,
            "categories": {},
            "strengths": [],
            "improvements": [],
            "feedback": "Cannot evaluate empty script.",
            "error": "Empty script provided"
        }
    
    try:
        # Create a custom HTTP client that ignores SSL errors
        http_client = httpx.Client(verify=False)
        client = Groq(api_key=api_key, http_client=http_client)
        
        evaluation_prompt = generate_evaluation_prompt(script)
        
        # System prompt for the judge
        system_prompt = """You are an expert evaluator for Hinglish podcast conversations. 
Your task is to critically assess the naturalness and quality of dialogue between two podcast hosts.
You understand both Hindi and English, and you're familiar with Gen-Z Indian communication patterns.
Be fair but critical in your evaluation. Give specific, actionable feedback.
Always respond with valid JSON in the exact format requested."""
        
        # Use Qwen3-32B as the critic model - excellent for evaluation and reasoning
        # This provides diversity from Llama 3.3 used for generation
        completion = client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": evaluation_prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent evaluation
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        response_content = completion.choices[0].message.content
        result = parse_evaluation_response(response_content)
        
        # Add metadata
        result["model_used"] = "qwen/qwen3-32b"
        result["script_segments"] = len(script)
        
        return result
        
    except Exception as e:
        print(f"Error during evaluation: {e}")
        return {
            "overall_score": 0,
            "categories": {},
            "strengths": [],
            "improvements": [],
            "feedback": f"Evaluation failed: {str(e)}",
            "error": str(e)
        }


def get_score_label(score: float) -> str:
    """Get a human-readable label for a score."""
    if score >= 4.5:
        return "Excellent"
    elif score >= 4.0:
        return "Great"
    elif score >= 3.5:
        return "Good"
    elif score >= 3.0:
        return "Average"
    elif score >= 2.0:
        return "Below Average"
    else:
        return "Needs Improvement"


def format_evaluation_summary(evaluation: dict) -> str:
    """Format evaluation results as a readable summary."""
    overall = evaluation.get("overall_score", 0)
    label = get_score_label(overall)
    
    summary = f"""
📊 PODCAST EVALUATION RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score: {overall}/5.0 - {label}

📈 Category Scores:
"""
    
    category_names = {
        "hinglish_quality": "Hinglish Quality",
        "conversational_naturalness": "Conversational Flow",
        "emotional_expression": "Emotional Expression",
        "content_coherence": "Content & Coherence",
        "host_chemistry": "Host Chemistry"
    }
    
    categories = evaluation.get("categories", {})
    for key, name in category_names.items():
        cat_data = categories.get(key, {})
        score = cat_data.get("score", 0)
        summary += f"  • {name}: {score}/5.0\n"
    
    strengths = evaluation.get("strengths", [])
    if strengths:
        summary += "\n✅ Strengths:\n"
        for s in strengths[:3]:
            summary += f"  • {s}\n"
    
    improvements = evaluation.get("improvements", [])
    if improvements:
        summary += "\n💡 Areas to Improve:\n"
        for i in improvements[:3]:
            summary += f"  • {i}\n"
    
    feedback = evaluation.get("feedback", "")
    if feedback:
        summary += f"\n📝 Feedback:\n{feedback}\n"
    
    return summary
