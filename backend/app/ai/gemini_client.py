import os
import json
import logging
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiAIService:
    def __init__(self):
        self.client = None
        self._init_client()

    def _init_client(self):
        api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if api_key:
            api_key = api_key.strip()
        
        if api_key and api_key != "your-gemini-api-key-here" and len(api_key) > 5:
            try:
                from google import genai
                self.client = genai.Client(api_key=api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")
                self.client = None
        else:
            self.client = None

    def is_configured(self) -> bool:
        self._init_client()
        return self.client is not None

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_instruction: str,
        model: str = "gemini-3.5-flash"
    ) -> str:
        """
        Multi-turn conversational response generator using official google-genai SDK.
        """
        self._init_client()
        if not self.client:
            raise ValueError("AI service is not configured.")

        from google.genai import types

        # Build contents from message history
        contents = []
        for msg in messages:
            role = "user" if msg.get("role") == "user" else "model"
            text_content = msg.get("content", "").strip()
            if text_content:
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=text_content)]
                    )
                )

        if not contents:
            raise ValueError("No message content provided for generation.")

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            top_p=0.95,
        )

        try:
            response = self.client.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
            return response.text or "I processed your request, but received an empty response from Gemini."
        except Exception as e:
            # Try fallback model if model not found or deprecated
            if model != "gemini-3.5-flash":
                try:
                    response = self.client.models.generate_content(
                        model="gemini-3.5-flash",
                        contents=contents,
                        config=config
                    )
                    return response.text or "I processed your request, but received an empty response."
                except Exception:
                    pass
            raise e

    def generate_response(self, prompt: str, context: Optional[str] = None) -> str:
        self._init_client()
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
        self._init_client()
        if not self.client:
            lower_text = resume_text.lower()
            detected_skills = []
            
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
                    detected_skills.append({"name": skill, "category": category, "match": True})

            score = min(95, max(40, len(detected_skills) * 8 + 30))
            return {
                "ats_score": score,
                "match_rating": f"{'High' if score >= 75 else 'Moderate'} Match (Target: {target_role})",
                "detected_skills": detected_skills,
                "strengths": [
                    f"Detected {len(detected_skills)} relevant technical keywords in resume text",
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

        try:
            prompt = f"""
            Analyze the following student resume for the target role: "{target_role}".
            Return a valid JSON object ONLY with the exact following schema:
            {{
                "ats_score": <integer between 40 and 95>,
                "match_rating": "<e.g. High Match (Target: AI/ML Engineer)>",
                "detected_skills": [
                    {{"name": "<skill name>", "category": "<e.g. Language, AI/ML, DevOps>", "match": <true or false>}}
                ],
                "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
                "weaknesses": ["<weakness 1>", "<weakness 2>"],
                "suggestions": ["<actionable advice 1>", "<actionable advice 2>"]
            }}

            Resume Content:
            {resume_text}
            """

            response = self.client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception:
            return {
                "ats_score": 75,
                "match_rating": f"Assessed Match (Target: {target_role})",
                "detected_skills": [{"name": "Extracted Text", "category": "Document", "match": True}],
                "strengths": ["Document successfully parsed and extracted"],
                "weaknesses": ["Add more technical domain keywords"],
                "suggestions": ["Review section headings and formatting"]
            }

gemini_ai = GeminiAIService()
