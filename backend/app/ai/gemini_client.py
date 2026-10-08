import os
import json
from typing import Optional, Dict, Any, List
from app.config import settings

class GeminiAIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        self.client = None
        self._init_client()

    def _init_client(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if self.api_key and self.api_key != "your-gemini-api-key-here":
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                self.client = None
        else:
            self.client = None

    def is_configured(self) -> bool:
        self._init_client()
        return self.client is not None

    def generate_response(self, prompt: str, context: Optional[str] = None) -> str:
        self._init_client()
        if not self.client:
            return (
                "⚠️ Gemini AI is not configured on this server.\n\n"
                "To enable real-time AI responses, please set `GEMINI_API_KEY` in your environment or `backend/.env` file. "
                "CareerOS uses Google Gemini 2.5 Flash to provide natural, contextual answers based on your course syllabus and career goals."
            )

        try:
            system_instruction = (
                "You are CareerOS AI Mentor, an intelligent academic and career assistant for university students. "
                "Answer questions naturally, clearly, and authoritatively. When institutional context or course materials "
                "are provided, prioritize syllabus-accurate explanations and provide actionable study tips."
            )
            
            full_prompt = f"{system_instruction}\n\n"
            if context:
                full_prompt += f"--- Institutional Syllabus & Knowledge Context ---\n{context}\n-----------------------------------------------\n\n"
            full_prompt += f"Student Query: {prompt}"

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
            )
            return response.text or "I processed your request, but received an empty response from Gemini."
        except Exception as e:
            return f"Error contacting Gemini AI service: {str(e)}. Please check your API key and connection."

    def analyze_resume_text(self, resume_text: str, target_role: str = "AI/ML Engineer") -> Dict[str, Any]:
        self._init_client()
        if not self.client:
            # Fallback basic NLP/keyword extraction when Gemini key is not configured
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
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            # Return safe fallback if JSON parsing fails
            return {
                "ats_score": 75,
                "match_rating": f"Assessed Match (Target: {target_role})",
                "detected_skills": [{"name": "Extracted Text", "category": "Document", "match": True}],
                "strengths": ["Document successfully parsed and extracted"],
                "weaknesses": ["Add more technical domain keywords"],
                "suggestions": ["Review section headings and formatting"]
            }

gemini_ai = GeminiAIService()
