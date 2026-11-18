"""
Mock Interview Evaluation Router
Evaluates student answers using Groq AI against ideal key points.
Falls back to deterministic keyword-matching if Groq is unavailable.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import re

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.ai.groq_client import groq_ai

router = APIRouter(prefix="/interview", tags=["Mock Interview"])


# ─── Request / Response Schemas ─────────────────────────────────────────────

class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    ideal_key_points: List[str]
    track: str           # dsa | system_design | behavioral | aiml
    difficulty: str = "Medium"


class ScoreDimension(BaseModel):
    label: str
    score: float          # 0–10
    grade: str            # Excellent | Good | Fair | Weak
    comment: str


class EvaluateAnswerResponse(BaseModel):
    overall_score: float          # 0–10, 1 dp
    technical_depth: ScoreDimension
    clarity: ScoreDimension
    completeness: ScoreDimension
    matched_key_points: List[str]
    missing_key_points: List[str]
    strengths: List[str]
    improvements: List[str]
    summary: str
    provider: str                 # "Groq" | "RuleEngine"


# ─── Helpers ────────────────────────────────────────────────────────────────

MIN_WORDS = 15          # Reject answers shorter than this
MIN_CHARS = 60

# Comprehensive vocabulary for detecting coherent English & technical responses
COMMON_ENGLISH_AND_TECH_VOCAB = {
    # Common English words
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he',
    'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
    'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
    'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
    'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
    'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had', 'does', 'did', 'done',
    'where', 'while', 'both', 'between', 'same', 'different', 'another', 'such', 'through', 'during',
    # Technical & Computer Science vocabulary
    'algorithm', 'code', 'data', 'function', 'class', 'method', 'variable', 'loop', 'array', 'list', 'hash',
    'table', 'tree', 'graph', 'node', 'pointer', 'memory', 'space', 'time', 'complexity', 'constant', 'linear',
    'fast', 'slow', 'cycle', 'detect', 'floyd', 'tortoise', 'hare', 'set', 'map', 'approach', 'solution',
    'case', 'base', 'step', 'steps', 'null', 'none', 'value', 'return', 'returns', 'store', 'stores',
    'system', 'design', 'cache', 'database', 'api', 'model', 'feature', 'input', 'output', 'user', 'team',
    'stack', 'queue', 'heap', 'binary', 'search', 'sort', 'dynamic', 'programming', 'recursion', 'iterative',
    'bfs', 'dfs', 'traversal', 'vertex', 'edge', 'weight', 'matrix', 'string', 'integer', 'boolean', 'big',
    'worst', 'best', 'average', 'amortized', 'collision', 'chaining', 'probing', 'bucket', 'load', 'factor',
    'precision', 'recall', 'accuracy', 'loss', 'gradient', 'overfitting', 'underfitting', 'neural', 'network',
    'transformer', 'attention', 'embedding', 'rag', 'llm', 'retrieval', 'vector', 'similarity', 'star',
    'situation', 'task', 'action', 'result', 'leadership', 'conflict', 'deadline', 'priority', 'project'
}


def detect_gibberish(text: str) -> bool:
    """
    Returns True if the text is random characters, keyboard spam, or unintelligible gibberish.
    """
    words = text.strip().split()
    if not words or len(words) < 3:
        return True

    # 1. Check for spam of single-letter words (e.g. 'f h g y4t g g g g f g')
    single_char_words = [w for w in words if len(w) == 1 and w.lower() not in ('a', 'i')]
    if len(single_char_words) / len(words) > 0.25:
        return True

    # 2. Check for repeating identical consecutive words (e.g. 'g g g g')
    rep_count = 0
    for i in range(1, len(words)):
        if words[i].lower() == words[i - 1].lower():
            rep_count += 1
            if rep_count >= 2:
                return True
        else:
            rep_count = 0

    # 3. Clean tokens and check recognizable vocabulary ratio
    clean_words = [re.sub(r'[^a-zA-Z]', '', w).lower() for w in words]
    clean_words = [w for w in clean_words if w]
    if not clean_words:
        return True

    # Check vowel presence in words of 3+ letters (gibberish like 'hfuihHFE', 'hFHEHEFHE', 'bcdfgh')
    vowels = set('aeiou')
    low_vowel_words = [w for w in clean_words if len(w) >= 3 and not (set(w) & vowels)]
    if len(low_vowel_words) / len(clean_words) > 0.30:
        return True

    recognized = sum(1 for w in clean_words if w in COMMON_ENGLISH_AND_TECH_VOCAB)
    ratio = recognized / len(clean_words)

    # If less than 20% of words are recognized English or technical words, it's gibberish
    if ratio < 0.20:
        return True

    return False


def _grade(score: float) -> str:
    if score >= 8.5:
        return "Excellent"
    if score >= 7.0:
        return "Good"
    if score >= 5.0:
        return "Fair"
    if score > 0.0:
        return "Weak"
    return "Zero"


def _keyword_overlap(text: str, point: str) -> float:
    """Return 0–1 fraction of meaningful words from point found in text."""
    stop = {"a", "an", "the", "is", "are", "was", "were", "in", "on", "at",
            "to", "of", "and", "or", "for", "with", "that", "this", "it",
            "how", "what", "when", "why", "which", "would", "should", "could"}
    text_words = set(re.sub(r"[^a-z0-9]", " ", text.lower()).split()) - stop
    point_words = set(re.sub(r"[^a-z0-9]", " ", point.lower()).split()) - stop
    if not point_words:
        return 0.0
    return len(text_words & point_words) / len(point_words)


def _rule_engine_evaluate(
    answer: str,
    ideal_key_points: List[str],
    track: str,
    difficulty: str,
) -> dict:
    """
    Deterministic keyword-based scoring. Returns the same schema as Groq.
    """
    answer_lower = answer.lower()
    word_count = len(answer.split())

    # 1. Key-point coverage
    matched = []
    missing = []
    for kp in ideal_key_points:
        overlap = _keyword_overlap(answer, kp)
        if overlap >= 0.35:
            matched.append(kp)
        else:
            missing.append(kp)

    coverage_ratio = len(matched) / max(len(ideal_key_points), 1)

    # 2. Length/depth heuristics
    length_score = min(10.0, word_count / 20)  # 200 words → 10

    # 3. Track-specific signal words
    signal_words = {
        "dsa":           ["time complexity", "space complexity", "o(n", "o(log", "algorithm", "edge case", "iteration", "recursive", "hash", "pointer", "traversal"],
        "system_design": ["scalability", "cache", "load balancer", "database", "api", "microservice", "latency", "throughput", "consistency", "availability", "cdn"],
        "behavioral":    ["situation", "task", "action", "result", "star", "team", "project", "deadline", "stakeholder", "communication", "outcome"],
        "aiml":          ["precision", "recall", "loss", "gradient", "feature", "model", "training", "overfitting", "accuracy", "neural", "classification", "regression"],
    }.get(track, [])

    hits = sum(1 for w in signal_words if w in answer_lower)
    signal_score = min(10.0, 4.0 + hits * 0.9)

    # 4. Complexity terminology bonus (DSA)
    complexity_stated = any(tok in answer_lower for tok in ["o(1)", "o(n)", "o(log n)", "o(n^2)", "o(n log n)", "constant time", "linear time", "logarithmic"])

    # 5. Composite scores
    if coverage_ratio == 0 and hits == 0:
        technical_score = 0.0
        clarity_score = 0.0
        completeness_score = 0.0
        overall = 0.0
    else:
        technical_score = round((coverage_ratio * 10 * 0.5) + (signal_score * 0.3) + (length_score * 0.2), 1)
        technical_score = max(0.0, min(10.0, technical_score))

        clarity_score = round(min(10.0, (word_count / 25) + hits * 0.4), 1)
        clarity_score = max(0.0, min(10.0, clarity_score))

        completeness_score = round(coverage_ratio * 10, 1)
        completeness_score = max(0.0, min(10.0, completeness_score))

        overall = round((technical_score * 0.4) + (clarity_score * 0.3) + (completeness_score * 0.3), 1)

    # 6. Strengths / improvements
    strengths = []
    improvements = []

    if word_count >= 80:
        strengths.append("Detailed explanation with sufficient elaboration.")
    elif word_count >= 40:
        strengths.append("Reasonable length response.")
    else:
        improvements.append("Answer is too brief — aim for at least 80 words to demonstrate depth.")

    if matched:
        strengths.append(f"Correctly covered {len(matched)} of {len(ideal_key_points)} expected key point(s).")
    if missing:
        improvements.append(f"Missed {len(missing)} key point(s): consider covering {missing[0]}.")

    if track == "dsa" and complexity_stated:
        strengths.append("Time/space complexity explicitly stated — excellent practice.")
    elif track == "dsa" and not complexity_stated:
        improvements.append("Always state time and space complexity explicitly (e.g. O(N) time, O(1) space).")

    if hits >= 3:
        strengths.append("Good use of domain-specific technical terminology.")
    elif hits == 0:
        improvements.append("Include domain-specific keywords to signal technical command.")

    summary = (
        f"Your answer scored {overall}/10. "
        f"You addressed {len(matched)}/{len(ideal_key_points)} key points. "
        + ("Strong technical signal present." if hits >= 3 else "Strengthen your use of technical terminology.")
    )

    return {
        "overall_score": overall,
        "technical_depth": {"label": "Technical Depth", "score": technical_score, "grade": _grade(technical_score), "comment": f"Signal words matched: {hits}/{len(signal_words)}"},
        "clarity": {"label": "Clarity & Structure", "score": clarity_score, "grade": _grade(clarity_score), "comment": f"{word_count} words written"},
        "completeness": {"label": "Completeness", "score": completeness_score, "grade": _grade(completeness_score), "comment": f"{len(matched)}/{len(ideal_key_points)} key points covered"},
        "matched_key_points": matched,
        "missing_key_points": missing,
        "strengths": strengths[:3],
        "improvements": improvements[:3],
        "summary": summary,
        "provider": "RuleEngine",
    }


# ─── Groq AI Evaluation ─────────────────────────────────────────────────────

GROQ_SYSTEM = (
    "You are a senior software engineering interviewer and career coach evaluating a "
    "university student's mock interview answer. Be fair, specific, and constructive. "
    "Return ONLY valid JSON — no markdown fences, no extra text."
)


def _build_groq_prompt(question: str, answer: str, key_points: List[str], track: str, difficulty: str) -> str:
    kp_text = "\n".join(f"- {kp}" for kp in key_points)
    return f"""
Evaluate the student's interview answer below.

QUESTION ({difficulty} | {track}):
{question}

IDEAL KEY POINTS (what an excellent answer should cover):
{kp_text}

STUDENT'S ANSWER:
{answer}

Return a JSON object with EXACTLY this structure (all numeric scores are floats 0.0–10.0):
{{
  "overall_score": <float between 0.0 and 10.0>,
  "technical_depth": {{
    "label": "Technical Depth",
    "score": <float between 0.0 and 10.0>,
    "grade": "<Excellent|Good|Fair|Weak|Zero>",
    "comment": "<one-line specific comment>"
  }},
  "clarity": {{
    "label": "Clarity & Structure",
    "score": <float between 0.0 and 10.0>,
    "grade": "<Excellent|Good|Fair|Weak|Zero>",
    "comment": "<one-line specific comment>"
  }},
  "completeness": {{
    "label": "Completeness",
    "score": <float between 0.0 and 10.0>,
    "grade": "<Excellent|Good|Fair|Weak|Zero>",
    "comment": "<one-line specific comment>"
  }},
  "matched_key_points": ["<verbatim or paraphrased key points the student addressed>"],
  "missing_key_points": ["<key points the student did not address>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<specific actionable improvement 1>", "<specific improvement 2>"],
  "summary": "<2-3 sentence holistic evaluation>"
}}

CRITICAL SCORING RULES:
- If the answer is gibberish, random characters, keyboard spam, completely off-topic, or fails to address the question in any way, you MUST award overall_score = 0.0 and all subscores = 0.0 with grade "Zero". Do NOT award 1.0 or any sympathy mark.
- If the answer is completely incorrect or has zero relevant technical facts, give 0.0.
- If the answer only vaguely touches 1 concept without explanation, score 1.0–2.5.
- If the answer partially covers the topic but misses most key points, score 3.0–5.5.
- Only give 8.0+ for answers that explicitly cover most key points with technical accuracy.
- Do NOT be generous — a one-sentence or vague answer should score low.
"""


async def _groq_evaluate(
    question: str,
    answer: str,
    key_points: List[str],
    track: str,
    difficulty: str,
) -> Optional[dict]:
    if not groq_ai.is_configured():
        return None
    try:
        import json
        prompt = _build_groq_prompt(question, answer, key_points, track, difficulty)
        raw = await asyncio.wait_for(
            groq_ai.generate_chat_response_async(
                messages=[{"role": "user", "content": prompt}],
                system_instruction=GROQ_SYSTEM,
                model=groq_ai.get_model_name(),
            ),
            timeout=12.0,
        )
        # Strip any accidental markdown fences
        raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`")
        data = json.loads(raw)
        data["provider"] = "Groq"
        return data
    except Exception:
        return None


# ─── Endpoint ────────────────────────────────────────────────────────────────

@router.post("/evaluate")
async def evaluate_interview_answer(
    req: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Evaluate a mock interview answer.
    - Rejects answers that are too short (< 15 words).
    - Uses Groq AI for rich evaluation; falls back to keyword-matching rule engine.
    """
    answer = (req.answer or "").strip()
    word_count = len(answer.split())

    if word_count < MIN_WORDS or len(answer) < MIN_CHARS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Answer too short ({word_count} words). "
                f"Please write at least {MIN_WORDS} words to receive a meaningful evaluation."
            ),
        )

    # Immediate rejection / zero-score for gibberish or keyboard spam
    if detect_gibberish(answer):
        return {
            "overall_score": 0.0,
            "technical_depth": {
                "label": "Technical Depth",
                "score": 0.0,
                "grade": "Zero",
                "comment": "No technical explanation present. The response appears to be random or unintelligible characters."
            },
            "clarity": {
                "label": "Clarity & Structure",
                "score": 0.0,
                "grade": "Zero",
                "comment": "The text lacks coherent English words or grammatical sentence structure."
            },
            "completeness": {
                "label": "Completeness",
                "score": 0.0,
                "grade": "Zero",
                "comment": "Failed to address any of the required key points (0/7 points covered)."
            },
            "matched_key_points": [],
            "missing_key_points": req.ideal_key_points,
            "strengths": [],
            "improvements": [
                "Enter a coherent, structured explanation instead of random keyboard characters.",
                "Directly address the question concepts (e.g. data structures, algorithms, time/space complexity) to earn marks."
            ],
            "summary": "Your answer scored 0 / 10 (Zero Marks). The response consists of unintelligible gibberish or random characters and cannot be awarded any credit.",
            "provider": "ValidationEngine"
        }

    # Try Groq first; fall back to rule engine
    result = await _groq_evaluate(
        question=req.question,
        answer=answer,
        key_points=req.ideal_key_points,
        track=req.track,
        difficulty=req.difficulty,
    )

    if result is None:
        result = _rule_engine_evaluate(
            answer=answer,
            ideal_key_points=req.ideal_key_points,
            track=req.track,
            difficulty=req.difficulty,
        )

    return result
