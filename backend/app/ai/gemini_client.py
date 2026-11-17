"""
Deprecated: Gemini client has been migrated to Groq Cloud API.
This module is maintained solely for backward compatibility.
"""
import warnings
from app.ai.groq_client import groq_ai, GroqAIService

warnings.warn(
    "app.ai.gemini_client is deprecated. Use app.ai.groq_client instead.",
    DeprecationWarning,
    stacklevel=2
)

# Aliases for backward compatibility
gemini_ai = groq_ai
GeminiAIService = GroqAIService

__all__ = ["gemini_ai", "GeminiAIService"]
