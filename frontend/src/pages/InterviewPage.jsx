import React, { useState } from 'react';
import {
  MessageSquare,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const interviewTracks = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    category: 'Technical',
    duration: '25 mins',
    questionsCount: 5,
    difficulty: 'Medium',
    desc: 'Algorithmic logic, edge cases, time/space complexity analysis and array/tree manipulations.'
  },
  {
    id: 'system_design',
    title: 'System Design & Architecture',
    category: 'Architecture',
    duration: '30 mins',
    questionsCount: 4,
    difficulty: 'Hard',
    desc: 'Scalability, microservices, caching layers, relational vs NoSQL databases, and API design.'
  },
  {
    id: 'behavioral',
    title: 'HR & Behavioral (STAR Method)',
    category: 'Behavioral',
    duration: '20 mins',
    questionsCount: 5,
    difficulty: 'Easy',
    desc: 'Situational leadership, handling conflicting deadlines, teamwork, and project retrospectives.'
  },
  {
    id: 'aiml',
    title: 'AI/ML Engineering Core',
    category: 'Domain Specific',
    duration: '25 mins',
    questionsCount: 5,
    difficulty: 'Medium',
    desc: 'Feature engineering, model evaluation metrics, deep learning architectures, and LLM/RAG pipelines.'
  }
];

const mockQuestionsDatabase = {
  dsa: [
    {
      q: "How would you detect a cycle in a singly linked list? Compare Floyd's Cycle-Finding Algorithm (Tortoise and Hare) with a Hash Set approach in terms of time and space complexity.",
      hint: "Think about pointer traversal rates versus memory overhead for visited node tracking.",
      idealKeyPoints: [
        "Hash Set: Stores memory addresses or references, O(N) time and O(N) auxiliary space.",
        "Floyd's Algorithm: Uses slow pointer (1 step) and fast pointer (2 steps).",
        "If they meet, a cycle exists. If fast reaches null/None, no cycle.",
        "Floyd's provides O(N) time and O(1) space, making it space-optimal."
      ]
    },
    {
      q: "Explain how a Hash Table handles collisions. What are the key differences between Separate Chaining and Open Addressing (Linear Probing)?",
      hint: "Consider load factor, cache locality, and clustering behavior when buckets get crowded.",
      idealKeyPoints: [
        "Separate Chaining: Each bucket holds a linked list or balanced tree of colliding entries.",
        "Open Addressing: Probes alternative table slots directly (linear, quadratic, or double hashing).",
        "Separate Chaining is simpler under high load factors; Open Addressing offers better CPU cache performance when load factor is kept low (<0.7)."
      ]
    }
  ],
  system_design: [
    {
      q: "Design a high-throughput URL shortening service (like Bitly). How would you generate unique 7-character hash keys and ensure low-latency reads?",
      hint: "Consider base-62 encoding over a distributed counter, and Redis caching for hot redirect lookups.",
      idealKeyPoints: [
        "Base-62 encoding (a-z, A-Z, 0-9) on auto-incremented 64-bit IDs yields 62^7 = ~3.5 trillion URLs.",
        "Use distributed ID generator (e.g. Snowflake or pre-allocated Redis ranges) to prevent collision.",
        "Incorporate a Redis or Memcached caching layer for the 20% most popular redirects to minimize database reads.",
        "Use HTTP 302 Found (for analytics tracking) or HTTP 301 Moved Permanently (for browser-side caching)."
      ]
    }
  ],
  behavioral: [
    {
      q: "Describe a situation where a group project encountered a technical roadblock close to a deadline. How did you handle the challenge?",
      hint: "Structure your response using STAR: Situation, Task, Action, Result.",
      idealKeyPoints: [
        "Situation: Clearly state the academic or capstone project context and the specific technical bottleneck.",
        "Task: Describe your specific responsibility within the team.",
        "Action: Explain how you communicated with team members, decoupled blocking features, or researched solutions.",
        "Result: Share the measurable outcome (e.g., delivered on time, scored high in faculty review)."
      ]
    }
  ],
  aiml: [
    {
      q: "What is the difference between Precision and Recall? In what scenario would you prioritize high Recall over high Precision?",
      hint: "Think about medical diagnostics or fraud detection where false negatives carry critical real-world cost.",
      idealKeyPoints: [
        "Precision = True Positives / (True Positives + False Positives). Focuses on correctness among predicted positives.",
        "Recall = True Positives / (True Positives + False Negatives). Focuses on capturing all actual positive cases.",
        "Prioritize Recall when missing a positive is disastrous (e.g. disease screening, identifying critical security vulnerabilities).",
        "F1-Score or PR-AUC is used when balancing both metrics under class imbalance."
      ]
    }
  ]
};

const InterviewPage = () => {
  const { studentData } = useCareer();
  const [selectedTrack, setSelectedTrack] = useState(interviewTracks[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(3);
  const [readinessScore, setReadinessScore] = useState(76);

  const currentQuestions = mockQuestionsDatabase[selectedTrack.id] || mockQuestionsDatabase.dsa;
  const currentQ = currentQuestions[questionIndex % currentQuestions.length];

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    setQuestionIndex(0);
    setUserAnswer('');
    setShowEvaluation(false);
  };

  const handleEvaluate = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    setShowEvaluation(true);
  };

  const handleNextQuestion = () => {
    setQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setShowEvaluation(false);
  };

  return (
    <div className="space-y-6">
      
      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-xs font-medium text-blue-300">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Mock Interview Arena</span>
            <span className="text-slate-400">•</span>
            <span>Module 7</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Technical & Behavioral Interview Simulator
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Practice domain-specific technical questions, systems architecture problem prompts, and HR situational scenarios tailored to your career goal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-center min-w-[130px]">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Practice Score</span>
            <span className="text-2xl font-bold text-emerald-400">{readinessScore}%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Interview Ready</span>
          </div>
        </div>
      </div>

      {/* ─── Stat Overview ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Interview Readiness"
          value={`${readinessScore}%`}
          subtitle="Benchmark for Campus Drives"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Sessions Completed"
          value={completedSessionsCount}
          subtitle="DSA & Behavioral"
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Active Target Track"
          value={selectedTrack.category}
          subtitle={selectedTrack.title}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Average Answer Score"
          value="8.2 / 10"
          subtitle="Evaluated on STAR method"
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {/* ─── Main Interface Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Track Selector Column */}
        <div className="space-y-4">
          <Card
            title="Interview Tracks"
            subtitle="Select a focused question set"
          >
            <div className="space-y-2.5">
              {interviewTracks.map(track => {
                const isSelected = selectedTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 ring-1 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {track.title}
                      </span>
                      <Badge variant={track.difficulty === 'Easy' ? 'success' : track.difficulty === 'Medium' ? 'warning' : 'danger'} size="sm">
                        {track.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {track.desc}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{track.questionsCount} questions</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            title="Interview Tips"
            subtitle="Campus recruitment guidelines"
          >
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>State time and space complexity explicitly for every algorithmic response.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>For behavioral rounds, structure answers around Situation, Task, Action, and Result.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Reference your verified GitHub projects and capstone evidence when asked for examples.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Live Question & Evaluation Console */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title={`Active Question (${(questionIndex % currentQuestions.length) + 1} of ${currentQuestions.length})`}
            subtitle={selectedTrack.title}
            action={
              <Button variant="ghost" size="sm" onClick={handleNextQuestion}>
                Skip Question
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            <div className="space-y-4">
              
              {/* Question Statement Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Interview Prompt:</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                  {currentQ.q}
                </p>
                {currentQ.hint && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300">Strategy Hint:</strong> {currentQ.hint}
                  </div>
                )}
              </div>

              {/* Student Response Editor */}
              <form onSubmit={handleEvaluate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Response:
                  </label>
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your structured explanation, algorithm breakdown, complexity analysis, or STAR response..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {typeof userAnswer === 'string' ? userAnswer.trim().split(/\s+/).filter(Boolean).length : 0} words written
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserAnswer('')}
                      disabled={!userAnswer}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!userAnswer.trim()}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Evaluate Answer
                    </Button>
                  </div>
                </div>
              </form>

              {/* Evaluation Output Breakdown */}
              {showEvaluation && (
                <div className="mt-5 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        AI Evaluator Diagnostic
                      </h4>
                    </div>
                    <Badge variant="success" size="sm">Evaluation Complete</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Technical Depth</span>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">8.5 / 10</div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Complexity Stated</span>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Strong</div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Clarity</span>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Clear</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/40">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      Benchmark Key Points (What Recruiters Expect):
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {currentQ.idealKeyPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm" onClick={handleNextQuestion}>
                      Proceed to Next Question
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
