import os
import json
import logging
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b"


class GroqAIService:
    def __init__(self):
        self.client = None
        self.async_client = None
        self._current_api_key = None
        self._init_clients()

    def _get_api_key(self) -> Optional[str]:
        if "GROQ_API_KEY" in os.environ:
            api_key = os.environ.get("GROQ_API_KEY", "")
        else:
            api_key = getattr(settings, "GROQ_API_KEY", "")
            if not api_key:
                try:
                    from dotenv import dotenv_values
                    env_vals = dotenv_values()
                    api_key = env_vals.get("GROQ_API_KEY", "")
                except Exception:
                    pass
        if api_key:
            api_key = api_key.strip()
        return api_key

    def get_model_name(self) -> str:
        model = os.getenv("GROQ_MODEL")
        if not model:
            try:
                from dotenv import dotenv_values
                env_vals = dotenv_values()
                model = env_vals.get("GROQ_MODEL")
            except Exception:
                pass
        if not model:
            model = getattr(settings, "GROQ_MODEL", DEFAULT_GROQ_MODEL)
        return str(model).strip() if model else DEFAULT_GROQ_MODEL

    def _init_clients(self):
        api_key = self._get_api_key()
        placeholder_keys = ["", "your_groq_api_key", "your-groq-api-key-here", "your_groq_api_key_here"]
        
        if self.client is not None and api_key == self._current_api_key:
            return

        if api_key and api_key not in placeholder_keys and len(api_key) > 5:
            try:
                from groq import Groq, AsyncGroq
                self.client = Groq(
                    api_key=api_key,
                    timeout=30.0,
                    max_retries=2
                )
                self.async_client = AsyncGroq(
                    api_key=api_key,
                    timeout=30.0,
                    max_retries=2
                )
                self._current_api_key = api_key
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
                self.client = None
                self.async_client = None
                self._current_api_key = None
        else:
            self.client = None
            self.async_client = None
            self._current_api_key = None

    def is_configured(self) -> bool:
        self._init_clients()
        return self.client is not None

    def _build_groq_messages(
        self,
        messages: List[Dict[str, str]],
        system_instruction: Optional[str] = None
    ) -> List[Dict[str, str]]:
        formatted: List[Dict[str, str]] = []
        if system_instruction and system_instruction.strip():
            formatted.append({
                "role": "system",
                "content": system_instruction.strip()
            })

        for msg in messages:
            raw_role = msg.get("role", "user")
            role = "user" if raw_role == "user" else "assistant"
            content = msg.get("content", "").strip()
            if content:
                formatted.append({
                    "role": role,
                    "content": content
                })
        return formatted

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_instruction: str,
        model: Optional[str] = None
    ) -> str:
        """
        Multi-turn conversational response generator using official Groq Python SDK.
        """
        self._init_clients()
        if not self.client:
            raise ValueError("AI service is not configured. Set GROQ_API_KEY in backend/.env to enable live responses.")

        groq_messages = self._build_groq_messages(messages, system_instruction)
        if len(groq_messages) <= (1 if system_instruction else 0):
            raise ValueError("No message content provided for generation.")

        target_model = model or self.get_model_name()

        try:
            completion = self.client.chat.completions.create(
                model=target_model,
                messages=groq_messages,
                temperature=0.7,
                max_tokens=2048,
                top_p=0.95
            )
            response_content = completion.choices[0].message.content
            return response_content or "I processed your request, but received an empty response from Groq."
        except Exception as e:
            logger.error(f"Groq API chat completion failed: {e}")
            raise e

    async def generate_chat_response_async(
        self,
        messages: List[Dict[str, str]],
        system_instruction: str,
        model: Optional[str] = None
    ) -> str:
        """
        Asynchronous multi-turn conversational response generator using AsyncGroq.
        """
        self._init_clients()
        if not self.async_client:
            raise ValueError("AI service is not configured. Set GROQ_API_KEY in backend/.env to enable live responses.")

        groq_messages = self._build_groq_messages(messages, system_instruction)
        if len(groq_messages) <= (1 if system_instruction else 0):
            raise ValueError("No message content provided for generation.")

        target_model = model or self.get_model_name()

        try:
            completion = await self.async_client.chat.completions.create(
                model=target_model,
                messages=groq_messages,
                temperature=0.7,
                max_tokens=2048,
                top_p=0.95
            )
            response_content = completion.choices[0].message.content
            return response_content or "I processed your request, but received an empty response from Groq."
        except Exception as e:
            logger.error(f"Async Groq API chat completion failed: {e}")
            raise e

    def generate_response(self, prompt: str, context: Optional[str] = None) -> str:
        """
        Generate a single response with optional retrieved or student context.
        """
        self._init_clients()
        if not self.client:
            return "AI service is not configured."

        system_instruction = (
            "You are CareerOS AI Mentor, an intelligent academic and career assistant for university students. "
            "Answer questions naturally, clearly, authoritatively, and thoroughly with helpful examples. "
            "Format responses using Markdown with code blocks, headings, and bullet points where helpful."
        )

        messages = []
        if context:
            messages.append({
                "role": "user",
                "content": f"[Context Information]:\n{context}\n\nPlease use this context to inform your answer."
            })
            messages.append({
                "role": "assistant",
                "content": "Understood. I will use this context along with my expertise to assist you."
            })

        messages.append({"role": "user", "content": prompt})

        return self.generate_chat_response(messages, system_instruction=system_instruction)

    def analyze_resume_text(self, resume_text: str, target_role: str = "AI/ML Engineer") -> Dict[str, Any]:
        """
        Analyze a candidate resume against target role requirements and return structured ATS analysis.
        """
        self._init_clients()
        lower_text = resume_text.lower()

        # Heuristic fallback if Groq is offline or parsing fails
        def _heuristic_analysis() -> Dict[str, Any]:
            detected = []
            common_skills = [
                ("Python", "Language"), ("C++", "Language"), ("Java", "Language"),
                ("JavaScript", "Language"), ("TypeScript", "Language"), ("SQL", "Database"),
                ("PostgreSQL", "Database"), ("MongoDB", "Database"), ("React", "Frontend"),
                ("FastAPI", "Backend"), ("Node.js", "Backend"), ("Django", "Backend"),
                ("PyTorch", "AI/ML"), ("TensorFlow", "AI/ML"), ("NumPy", "AI/ML"),
                ("Pandas", "AI/ML"), ("Scikit-Learn", "AI/ML"), ("Docker", "DevOps"),
                ("Git", "DevOps"), ("Kubernetes", "Cloud"), ("AWS", "Cloud")
            ]
            for skill, category in common_skills:
                if skill.lower() in lower_text:
                    detected.append({"name": skill, "category": category, "match": True})

            score = min(95, max(40, len(detected) * 8 + 30))
            return {
                "ats_score": score,
                "match_rating": f"{'High' if score >= 75 else 'Moderate'} Match (Target: {target_role})",
                "detected_skills": detected,
                "strengths": [
                    f"Detected {len(detected)} relevant technical keywords in resume text",
                    "Contains contact and profile identifiers"
                ],
                "weaknesses": [
                    "Ensure project descriptions include quantifiable business metrics",
                    f"Missing explicit keywords for target role: {target_role}"
                ],
                "suggestions": [
                    "Follow the Google X-Y-Z formula for project bullet points: 'Accomplished [X], as measured by [Y], by doing [Z]'",
                    "Include links to verified GitHub repositories with active tests"
                ]
            }

        if not self.client:
            return _heuristic_analysis()

        prompt = f"""
        Analyze the following student resume for the target role: "{target_role}".
        Return a valid JSON object ONLY with the exact following schema:
        {{
            "ats_score": <integer between 40 and 95>,
            "match_rating": "<e.g. High Match (Target: {target_role})>",
            "detected_skills": [
                {{"name": "<skill name>", "category": "<e.g. Language, AI/ML, DevOps>", "match": true}}
            ],
            "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
            "weaknesses": ["<weakness 1>", "<weakness 2>"],
            "suggestions": ["<actionable advice 1>", "<actionable advice 2>"]
        }}

        Resume Content:
        {resume_text[:4000]}
        """

        try:
            target_model = self.get_model_name()
            completion = self.client.chat.completions.create(
                model=target_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert technical recruiter and ATS parsing specialist. You output strict JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            raw_json = completion.choices[0].message.content
            return json.loads(raw_json)
        except Exception as e:
            logger.warning(f"Groq resume analysis failed, falling back to heuristics: {e}")
            return _heuristic_analysis()


groq_ai = GroqAIService()

