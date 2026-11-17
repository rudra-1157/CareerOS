import os
import sys
import unittest
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
load_dotenv(override=True)

from app.database import Base, engine, SessionLocal
from app.models.user import User, Role
from app.routers.auth import seed_demo_users_if_needed
from app.services.auth_service import create_access_token, verify_password
from app.dependencies.auth import get_current_user
from app.ai.groq_client import groq_ai
from app.services.mentor_service import mentor_service
from app.rag.retriever import rag_retriever


class TestCareerOSE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_demo_users_if_needed(db)

    def setUp(self):
        self.db = SessionLocal()
        self.student = self.db.query(User).filter(User.email == "student@careeros.edu").first()

    def tearDown(self):
        self.db.close()

    def test_01_auth_seed_and_credentials(self):
        """Verify demo student exists and password matches."""
        self.assertIsNotNone(self.student, "Student demo account must exist")
        self.assertTrue(verify_password("password123", self.student.password_hash))

    def test_02_jwt_auth_resolution(self):
        """Verify token creation and resolving current user without 'Could not validate credentials'."""
        token = create_access_token(data={"sub": str(self.student.id), "email": self.student.email, "role": self.student.role})
        resolved_user = get_current_user(token=token, db=self.db)
        self.assertEqual(resolved_user.id, self.student.id)
        self.assertEqual(resolved_user.email, "student@careeros.edu")

    def test_03_groq_configuration_and_model(self):
        """Verify Groq AI service is configured and uses openai/gpt-oss-120b."""
        self.assertTrue(groq_ai.is_configured(), "Groq must be configured with valid GROQ_API_KEY")
        model = groq_ai.get_model_name()
        print(f"\n[Test] Active Groq Model: {model}")
        self.assertEqual(model, "openai/gpt-oss-120b")

    def test_04_rag_curriculum_retrieval(self):
        """Verify RAG retrieval returns accurate curriculum materials for CS queries."""
        docs = rag_retriever.retrieve("What is Peterson's solution for critical section problem?", top_k=2)
        self.assertTrue(len(docs) > 0, "RAG should retrieve matching syllabus documents")
        self.assertTrue(any("Operating Systems" in d.get("category", "") or "Process" in d.get("title", "") for d in docs))

    def test_05_live_groq_mentor_chat(self):
        """Test sending a question to the AI Mentor and receiving a live Groq response."""
        res = mentor_service.chat(
            user=self.student,
            message="What is the time complexity of QuickSort in the best and worst cases?",
            session_id=None,
            db=self.db
        )
        self.assertIn("session_id", res)
        self.assertIn("ai_message", res)
        content = res["ai_message"]["content"]
        print(f"\n[Test] AI Mentor Response Snippet:\n{content[:200]}...")
        self.assertTrue(len(content) > 30)
        self.assertIn("O(", content)

    def test_06_multi_turn_conversation_persistence(self):
        """Test multi-turn conversation and persistence across messages."""
        # Turn 1
        res1 = mentor_service.chat(
            user=self.student,
            message="I am learning Python. Give me a function to reverse a string.",
            session_id=None,
            db=self.db
        )
        session_id = res1["session_id"]
        
        # Turn 2
        res2 = mentor_service.chat(
            user=self.student,
            message="Now modify it to check if the string is a palindrome.",
            session_id=session_id,
            db=self.db
        )
        self.assertEqual(res2["session_id"], session_id)
        self.assertIn("palindrome", res2["ai_message"]["content"].lower())

        # Verify session details in database
        details = mentor_service.get_session_details(self.student, session_id, self.db)
        self.assertEqual(len(details["messages"]), 4)  # 2 user + 2 assistant messages

        # Clean up test session
        mentor_service.delete_session(self.student, session_id, self.db)


if __name__ == "__main__":
    unittest.main()
