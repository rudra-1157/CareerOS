from app.ai.groq_client import groq_ai, GroqAIService

# Backwards compatibility aliases
gemini_ai = groq_ai
GeminiAIService = GroqAIService

__all__ = ["groq_ai", "GroqAIService", "gemini_ai", "GeminiAIService"]
