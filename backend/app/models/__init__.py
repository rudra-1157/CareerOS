from app.models.user import User, StudentProfile, FacultyProfile, AdminProfile, Role
from app.models.department import Department, Course, Subject
from app.models.skill import Skill, StudentSkill, SkillGap
from app.models.project import Project, ProjectTechnology
from app.models.resume import Resume, ResumeAnalysis
from app.models.github import GithubProfile, GithubRepository, GitHubProfile
from app.models.coding import CodingProblem, CodingSubmission, CodingTestCase, Challenge
from app.models.learning import LearningActivity, LearningResource
from app.models.chat import ChatSession, ChatMessage
from app.models.career import CareerGoal
from app.models.roadmap import Roadmap, RoadmapItem, RoadmapTask
from app.models.achievement import Achievement, StudentAchievement
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.assessment import Assessment, AssessmentResult
from app.models.company import Company, CandidateProfile
from app.models.job import JobListing, JobSkillRequirement, JobApplication, StudentJobPreference
from app.models.notification import Notification, AuditLog
