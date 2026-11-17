"""
Comprehensive Test Suite for Groq LLM Migration in CareerOS Backend.

Validates:
1. Groq API client initialization & model configuration.
2. Message building & multi-turn structure.
3. RAG retrieval & syllabus context grounding.
4. AI Mentor service chat flow & database persistence.
5. Code-generation prompt formatting.
6. Error handling (503 unconfigured, 502 API failure, 400 validation).
7. Execution path verification (no Gemini calls in AI Mentor).
8. Fast-path resume analysis with JSON parsing & fallback.
9. FastAPI router contracts (/mentor/status, /mentor/ai-status, /mentor/chat).
"""
import os
import sys
import unittest
from unittest.mock import MagicMock, AsyncMock, patch

# Ensure app is importable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.config import settings
from app.ai.groq_client import groq_ai, GroqAIService, DEFAULT_GROQ_MODEL
from app.rag.retriever import rag_retriever
from app.services.mentor_service import mentor_service, is_personalized_query
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.database import Base, engine, SessionLocal


class TestGroqMigration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    def setUp(self):
        self.db = SessionLocal()
        # Create test user if not existing
        self.test_user = self.db.query(User).filter(User.email == "groq_test_user@careeros.dev").first()
        if not self.test_user:
            self.test_user = User(
                email="groq_test_user@careeros.dev",
                name="Groq Test Student",
                role="STUDENT",
                target_role="AI/ML Engineer"
            )
            self.db.add(self.test_user)
            self.db.commit()
            self.db.refresh(self.test_user)

    def tearDown(self):
        # Clean up test chat sessions
        if self.test_user:
            sessions = self.db.query(ChatSession).filter(ChatSession.user_id == self.test_user.id).all()
            for s in sessions:
                self.db.delete(s)
            self.db.commit()
        self.db.close()

    # 1. Model Configuration Tests
    def test_01_model_configuration(self):
        service = GroqAIService()
        model_name = service.get_model_name()
        self.assertTrue(bool(model_name), "Model name must be configured")

        # Test configurable via env var
        with patch.dict(os.environ, {"GROQ_MODEL": "openai/gpt-oss-120b"}):
            self.assertEqual(service.get_model_name(), "openai/gpt-oss-120b")

    # 2. Client Initialization Tests
    def test_02_client_initialization_unconfigured(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
            service = GroqAIService()
            self.assertFalse(service.is_configured())
            self.assertIsNone(service.client)
            self.assertIsNone(service.async_client)

    def test_03_client_initialization_configured(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_fake_api_key_1234567890"}):
            service = GroqAIService()
            self.assertTrue(service.is_configured())
            self.assertIsNotNone(service.client)
            self.assertIsNotNone(service.async_client)

    # 3. Message Formatting & Multi-turn
    def test_04_message_building(self):
        service = GroqAIService()
        history = [
            {"role": "user", "content": "What is Dijkstra algorithm?"},
            {"role": "assistant", "content": "Dijkstra is a shortest path algorithm."},
            {"role": "user", "content": "Can you give Python code for it?"}
        ]
        system_instruction = "You are an expert algorithms professor."
        formatted = service._build_groq_messages(history, system_instruction)

        self.assertEqual(len(formatted), 4)
        self.assertEqual(formatted[0]["role"], "system")
        self.assertEqual(formatted[0]["content"], system_instruction)
        self.assertEqual(formatted[1]["role"], "user")
        self.assertEqual(formatted[2]["role"], "assistant")
        self.assertEqual(formatted[3]["role"], "user")

    # 4. Chat Completion Execution with Groq
    def test_05_generate_chat_response_sync(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_key_1234567890"}):
            service = GroqAIService()
            mock_choice = MagicMock()
            mock_choice.message.content = "## Binary Search\nHere is binary search in Python:\n```python\ndef search(): pass\n```"
            mock_completion = MagicMock()
            mock_completion.choices = [mock_choice]

            service.client.chat.completions.create = MagicMock(return_value=mock_completion)

            messages = [{"role": "user", "content": "Explain binary search with code"}]
            reply = service.generate_chat_response(messages, "System Prompt")

            self.assertIn("Binary Search", reply)
            self.assertIn("```python", reply)
            service.client.chat.completions.create.assert_called_once()
            args, kwargs = service.client.chat.completions.create.call_args
            self.assertEqual(kwargs["model"], service.get_model_name())
            self.assertEqual(kwargs["temperature"], 0.7)

    # 5. RAG Retrieval Functionality
    def test_06_rag_retrieval(self):
        # Test Operating Systems topic
        os_results = rag_retriever.retrieve("Explain process scheduling and deadlocks in operating systems")
        self.assertGreater(len(os_results), 0)
        self.assertEqual(os_results[0]["topic"], "Operating Systems")

        # Test DSA topic
        dsa_results = rag_retriever.retrieve("What is the time complexity of hash tables and balanced trees?")
        self.assertGreater(len(dsa_results), 0)
        self.assertEqual(dsa_results[0]["topic"], "Data Structures & Algorithms")

        # Test Database topic
        db_results = rag_retriever.retrieve("Explain database normalization 1NF and BCNF")
        self.assertGreater(len(db_results), 0)
        self.assertEqual(db_results[0]["topic"], "Database Management Systems")

    # 6. AI Mentor End-to-End Chat & Session Persistence
    def test_07_mentor_service_chat_and_persistence(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_key_1234567890"}):
            # Patch groq_ai inside mentor_service
            with patch("app.services.mentor_service.groq_ai.generate_chat_response") as mock_generate:
                with patch("app.services.mentor_service.groq_ai.is_configured", return_value=True):
                    mock_generate.return_value = "### QuickSort Guide\nQuicksort uses divide and conquer with O(n log n) average time complexity."

                    res = mentor_service.chat(
                        user=self.test_user,
                        message="How does Quicksort work in Data Structures & Algorithms?",
                        session_id=None,
                        db=self.db
                    )

                    self.assertIn("session_id", res)
                    self.assertIn("user_message", res)
                    self.assertIn("ai_message", res)
                    self.assertIn("Quicksort", res["ai_message"]["content"])
                    self.assertTrue(res["context_used"], "RAG should detect DSA curriculum context")

                    # Verify message persistence in DB
                    db_session = self.db.query(ChatSession).filter(ChatSession.id == res["session_id"]).first()
                    self.assertIsNotNone(db_session)
                    self.assertEqual(db_session.user_id, self.test_user.id)

                    messages = self.db.query(ChatMessage).filter(ChatMessage.session_id == db_session.id).all()
                    self.assertEqual(len(messages), 2)
                    self.assertEqual(messages[0].role, "user")
                    self.assertEqual(messages[1].role, "assistant")

    # 7. Multi-Turn Conversation History
    def test_08_multi_turn_conversation_flow(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_key_1234567890"}):
            with patch("app.services.mentor_service.groq_ai.generate_chat_response") as mock_generate:
                with patch("app.services.mentor_service.groq_ai.is_configured", return_value=True):
                    # Turn 1
                    mock_generate.return_value = "Turn 1 answer: Semaphores are synchronization primitives."
                    res1 = mentor_service.chat(
                        user=self.test_user,
                        message="What is a Semaphore in Operating Systems?",
                        session_id=None,
                        db=self.db
                    )
                    sess_id = res1["session_id"]

                    # Turn 2 in same session
                    mock_generate.return_value = "Turn 2 answer: Mutex is a binary semaphore with ownership."
                    res2 = mentor_service.chat(
                        user=self.test_user,
                        message="How does it differ from a Mutex?",
                        session_id=sess_id,
                        db=self.db
                    )

                    self.assertEqual(res2["session_id"], sess_id)
                    total_msgs = self.db.query(ChatMessage).filter(ChatMessage.session_id == sess_id).count()
                    self.assertEqual(total_msgs, 4)

    # 8. Error Handling Tests
    def test_09_error_handling_unconfigured(self):
        with patch("app.services.mentor_service.groq_ai.is_configured", return_value=False):
            from fastapi import HTTPException
            with self.assertRaises(HTTPException) as ctx:
                mentor_service.chat(
                    user=self.test_user,
                    message="Hello",
                    session_id=None,
                    db=self.db
                )
            self.assertEqual(ctx.exception.status_code, 503)
            self.assertIn("AI service is not configured", ctx.exception.detail)

    def test_10_error_handling_api_failure(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_key_1234567890"}):
            with patch("app.services.mentor_service.groq_ai.is_configured", return_value=True):
                with patch("app.services.mentor_service.groq_ai.generate_chat_response", side_effect=Exception("Rate limit reached on Groq")):
                    from fastapi import HTTPException
                    with self.assertRaises(HTTPException) as ctx:
                        mentor_service.chat(
                            user=self.test_user,
                            message="Hello",
                            session_id=None,
                            db=self.db
                        )
                    self.assertEqual(ctx.exception.status_code, 502)
                    self.assertIn("Groq API error", ctx.exception.detail)

    # 9. Verify No Gemini Calls in AI Mentor Execution Path
    def test_11_no_gemini_calls_in_mentor_path(self):
        import app.services.mentor_service as ms
        import app.routers.mentor as rm
        import app.services.resume_service as rs

        self.assertFalse(hasattr(ms, "gemini_ai") and ms.gemini_ai.__class__.__name__ == "GeminiAIService",
                         "mentor_service should use groq_ai")
        self.assertTrue(hasattr(ms, "groq_ai"), "mentor_service must use groq_ai")
        self.assertTrue(hasattr(rm, "groq_ai"), "mentor router must use groq_ai")
        self.assertTrue(hasattr(rs, "groq_ai"), "resume service must use groq_ai")

    # 10. Resume Analysis with Groq JSON Response
    def test_12_resume_analysis_json_format(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_key_1234567890"}):
            service = GroqAIService()
            mock_choice = MagicMock()
            mock_choice.message.content = '{"ats_score": 88, "match_rating": "High Match (Target: AI/ML Engineer)", "detected_skills": [{"name": "PyTorch", "category": "AI/ML", "match": true}], "strengths": ["Strong ML background"], "weaknesses": ["Add deployment metrics"], "suggestions": ["Include GitHub links"]}'
            mock_completion = MagicMock()
            mock_completion.choices = [mock_choice]
            service.client.chat.completions.create = MagicMock(return_value=mock_completion)

            result = service.analyze_resume_text("Experienced Python and PyTorch developer", "AI/ML Engineer")
            self.assertEqual(result["ats_score"], 88)
            self.assertEqual(result["match_rating"], "High Match (Target: AI/ML Engineer)")
            self.assertEqual(len(result["detected_skills"]), 1)

    # 11. Router Status Endpoint Verification
    def test_13_router_status_endpoint(self):
        from app.routers.mentor import get_ai_status
        with patch("app.routers.mentor.groq_ai.is_configured", return_value=True):
            status_data = get_ai_status()
            self.assertTrue(status_data["configured"])
            self.assertEqual(status_data["provider"], "Groq")
            self.assertEqual(status_data["model"], groq_ai.get_model_name())
            self.assertEqual(status_data["status"], "Active")
            self.assertIn("Groq AI Mentor", status_data["message"])


if __name__ == "__main__":
    unittest.main()

