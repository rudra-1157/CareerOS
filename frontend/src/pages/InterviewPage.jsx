import React, { useState } from 'react';
import {
  MessageSquare, Play, RotateCcw, CheckCircle2, XCircle,
  Clock, Sparkles, HelpCircle, Lightbulb, Award,
  ChevronRight, BookOpen, Loader2, AlertCircle, TrendingUp,
  Target, Info
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { interviewService } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

// ─── Static data ──────────────────────────────────────────────────────────────
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
        "Separate Chaining is simpler under high load factors.",
        "Open Addressing offers better CPU cache performance when load factor is kept below 0.7."
      ]
    },
    {
      q: "What is Dynamic Programming? Explain the difference between memoization (top-down) and tabulation (bottom-up) with an example.",
      hint: "Use the Fibonacci sequence or Longest Common Subsequence as a concrete example.",
      idealKeyPoints: [
        "Dynamic Programming solves problems by breaking them into overlapping subproblems and storing results.",
        "Memoization (top-down): Recursive approach that caches results of already-solved subproblems.",
        "Tabulation (bottom-up): Iterative approach that fills a DP table from base cases upward.",
        "Memoization uses call stack space; tabulation avoids recursion overhead."
      ]
    },
    {
      q: "Describe BFS vs DFS for graph traversal. When would you choose one over the other?",
      hint: "Think about shortest-path problems vs deep path exploration, and memory usage.",
      idealKeyPoints: [
        "BFS uses a queue and explores level by level — finds shortest path in unweighted graphs.",
        "DFS uses a stack (or recursion) and explores as deep as possible before backtracking.",
        "BFS is preferred for shortest path, level-order traversal, and connectivity.",
        "DFS is preferred for cycle detection, topological sort, and exhaustive search."
      ]
    },
    {
      q: "Explain the concept of a balanced Binary Search Tree. How does an AVL tree maintain balance after insertions?",
      hint: "Focus on the balance factor and rotations (LL, RR, LR, RL).",
      idealKeyPoints: [
        "A balanced BST ensures O(log N) height, keeping all operations efficient.",
        "AVL tree maintains a balance factor (height difference between left and right subtree) of -1, 0, or 1.",
        "After an insertion, if balance is violated, rotations are performed: single (LL/RR) or double (LR/RL).",
        "AVL trees guarantee O(log N) for search, insertion, and deletion."
      ]
    }
  ],
  system_design: [
    {
      q: "Design a high-throughput URL shortening service (like Bitly). How would you generate unique 7-character hash keys and ensure low-latency reads?",
      hint: "Consider base-62 encoding over a distributed counter, and Redis caching for hot redirect lookups.",
      idealKeyPoints: [
        "Base-62 encoding (a-z, A-Z, 0-9) on auto-incremented 64-bit IDs yields ~3.5 trillion URLs.",
        "Use distributed ID generator (Snowflake or pre-allocated Redis ranges) to prevent collision.",
        "Incorporate Redis caching layer for the most popular redirects to minimize database reads.",
        "Use HTTP 302 Found for analytics tracking or HTTP 301 Moved Permanently for browser-side caching."
      ]
    },
    {
      q: "How would you design a notification system that delivers real-time alerts to millions of users (like WhatsApp or Instagram notifications)?",
      hint: "Think about fanout on write vs fanout on read, message queues, and push vs pull models.",
      idealKeyPoints: [
        "Use a message queue (Kafka or RabbitMQ) to decouple notification producers from consumers.",
        "For push notifications: APNs for iOS and FCM for Android; WebSocket or SSE for web.",
        "Fanout on write: Pre-generate notifications for all followers on post (suitable for low-follower accounts).",
        "Store undelivered notifications in a durable store (Cassandra) for offline users."
      ]
    },
    {
      q: "Explain CAP Theorem. How does it influence database selection for a distributed system?",
      hint: "Use examples: Cassandra (AP), HBase (CP), traditional RDBMS (CA in single-node).",
      idealKeyPoints: [
        "CAP Theorem: A distributed system can guarantee at most 2 of 3: Consistency, Availability, Partition Tolerance.",
        "Partition Tolerance is always required in distributed networks, so the real trade-off is C vs A.",
        "CP systems (e.g. HBase, Zookeeper) choose consistency over availability during partitions.",
        "AP systems (e.g. Cassandra, DynamoDB) choose availability over consistency during partitions."
      ]
    },
    {
      q: "How would you design the backend for a real-time collaborative document editor like Google Docs?",
      hint: "Focus on conflict resolution — Operational Transformation (OT) or CRDTs.",
      idealKeyPoints: [
        "Use WebSockets for real-time bidirectional communication between clients and server.",
        "Operational Transformation (OT) or CRDTs resolve concurrent edits without conflicts.",
        "Store document as a sequence of operations (event sourcing) rather than snapshots.",
        "Use Redis pub/sub or similar for broadcasting changes to all collaborators in a room."
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
        "Result: Share the measurable outcome (delivered on time, scored high in faculty review)."
      ]
    },
    {
      q: "Tell me about a time you had to learn a new technology or framework under a tight deadline. What was your approach?",
      hint: "Highlight your learning strategy, prioritization, and the outcome.",
      idealKeyPoints: [
        "Situation: Set the context — which technology, why it was needed, and the timeline constraint.",
        "Action: Describe how you prioritized learning (documentation, tutorials, small prototypes).",
        "Action: Mention how you asked for help or collaborated with teammates who knew the technology.",
        "Result: State what you built, the quality of the outcome, and what you would do differently."
      ]
    },
    {
      q: "Describe a conflict you had with a teammate and how you resolved it.",
      hint: "Focus on communication, empathy, and finding a constructive resolution.",
      idealKeyPoints: [
        "Situation: Describe the nature of the conflict — technical disagreement, different work styles, or miscommunication.",
        "Action: Explain how you initiated a calm conversation, listened to their perspective, and stated your own.",
        "Action: Describe the compromise or resolution reached and how responsibilities were reassigned.",
        "Result: Share the positive outcome — improved collaboration, project success, or stronger relationship."
      ]
    },
    {
      q: "Give an example of when you showed leadership even without a formal leadership title.",
      hint: "Think about times you took initiative, coordinated a team, or drove a decision.",
      idealKeyPoints: [
        "Situation: Describe the team setting and the gap in leadership or direction.",
        "Action: Explain what initiative you took — organizing the team, setting sub-goals, or resolving ambiguity.",
        "Result: Quantify the impact — project completed, team morale improved, feature shipped.",
        "Reflection: What you learned about leading by influence versus formal authority."
      ]
    },
    {
      q: "How do you prioritize tasks when you have multiple assignments due at the same time?",
      hint: "Mention frameworks like Eisenhower Matrix or MoSCoW prioritization.",
      idealKeyPoints: [
        "Explain how you assess urgency and importance — not all deadlines are equal.",
        "Describe using a prioritization method: Eisenhower Matrix, MoSCoW, or time-boxing.",
        "Mention proactive communication — informing stakeholders early if a deadline is at risk.",
        "Share a concrete example where this approach led to successfully managing competing deadlines."
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
        "Prioritize Recall when missing a positive is disastrous (e.g. disease screening, security vulnerability detection).",
        "F1-Score balances both metrics; PR-AUC is used under class imbalance."
      ]
    },
    {
      q: "Explain the concept of overfitting and underfitting. What techniques do you use to address each?",
      hint: "Think about the bias-variance tradeoff and regularization methods.",
      idealKeyPoints: [
        "Overfitting: Model learns noise in training data, performs poorly on unseen data (high variance).",
        "Underfitting: Model is too simple, fails to capture underlying patterns (high bias).",
        "To reduce overfitting: dropout, L1/L2 regularization, early stopping, cross-validation, data augmentation.",
        "To reduce underfitting: add more features, increase model complexity, reduce regularization strength."
      ]
    },
    {
      q: "What are embeddings in the context of Natural Language Processing? How are they used in modern LLMs?",
      hint: "Cover word2vec/GloVe foundations and how transformer-based models generate contextual embeddings.",
      idealKeyPoints: [
        "Embeddings are dense vector representations of tokens that encode semantic meaning in a continuous space.",
        "Early embeddings (Word2Vec, GloVe) are static — same vector regardless of context.",
        "Transformer models (BERT, GPT) generate contextual embeddings — the same word gets different vectors in different sentences.",
        "In LLMs, embeddings power semantic search, retrieval-augmented generation (RAG), and similarity matching."
      ]
    },
    {
      q: "What is the purpose of the attention mechanism in Transformers? How does self-attention work?",
      hint: "Explain Query, Key, Value matrices and how they compute attention weights.",
      idealKeyPoints: [
        "Attention allows the model to weigh the importance of each token relative to all others when encoding a sequence.",
        "Self-attention computes Query (Q), Key (K), and Value (V) matrices from the input embeddings.",
        "Attention scores = softmax(QK^T / sqrt(d_k)) · V, where d_k is the key dimension.",
        "Multi-head attention runs multiple attention heads in parallel, each learning different relationship patterns."
      ]
    },
    {
      q: "What is Retrieval-Augmented Generation (RAG) and why is it useful for LLM applications?",
      hint: "Focus on the problem RAG solves — knowledge cutoffs and hallucination — and the pipeline.",
      idealKeyPoints: [
        "RAG grounds LLM responses in external, up-to-date knowledge retrieved at inference time.",
        "Pipeline: User query → embed query → vector similarity search → retrieve top-k documents → LLM generates answer conditioned on documents.",
        "Solves knowledge cutoff problem: LLM doesn't need to memorize all information during training.",
        "Reduces hallucination by forcing the model to ground answers in retrieved factual context."
      ]
    }
  ]
};

const MIN_WORDS = 15;

// ─── Score bar component ──────────────────────────────────────────────────────
function ScoreBar({ score, max = 10 }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : pct >= 40 ? 'bg-orange-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-10 text-right">{score}/10</span>
    </div>
  );
}

function GradeBadge({ grade }) {
  const styles = {
    Excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Good:      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    Fair:      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Weak:      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    Zero:      'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-900',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${styles[grade] || styles.Weak}`}>
      {grade}
    </span>
  );
}

function checkIsGibberish(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  // single character words spam like 'ff h g y4t g g g g f g'
  const singleCharWords = words.filter(w => w.length === 1 && !['a', 'i', 'A', 'I'].includes(w));
  if (singleCharWords.length / words.length > 0.25) return true;
  // repeating identical consecutive words (e.g. 'g g g g')
  let rep = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i].toLowerCase() === words[i - 1].toLowerCase()) {
      rep++;
      if (rep >= 2) return true;
    } else {
      rep = 0;
    }
  }
  // low vowel words for letter jumbles like 'hfuihHFE', 'hFHEHEFHE'
  const clean = words.map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase()).filter(Boolean);
  if (clean.length === 0) return true;
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  const lowVowels = clean.filter(w => w.length >= 3 && ![...w].some(c => vowels.has(c)));
  if (lowVowels.length / clean.length > 0.30) return true;
  return false;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const InterviewPage = () => {
  const { studentData } = useCareer();
  const [selectedTrack, setSelectedTrack] = useState(interviewTracks[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState('');
  const [sessionScores, setSessionScores] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const currentQuestions = mockQuestionsDatabase[selectedTrack.id] || mockQuestionsDatabase.dsa;
  const currentQ = currentQuestions[questionIndex % currentQuestions.length];
  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
  const isGibberish = checkIsGibberish(userAnswer);
  const isAnswerValid = wordCount >= MIN_WORDS && !isGibberish;

  const avgScore = sessionScores.length > 0
    ? (sessionScores.reduce((s, v) => s + v, 0) / sessionScores.length).toFixed(1)
    : null;

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    setQuestionIndex(0);
    setUserAnswer('');
    setEvaluation(null);
    setEvaluationError('');
    setShowHint(false);
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!isAnswerValid) return;

    setIsEvaluating(true);
    setEvaluationError('');
    setEvaluation(null);

    try {
      const result = await interviewService.evaluate({
        question: currentQ.q,
        answer: userAnswer.trim(),
        idealKeyPoints: currentQ.idealKeyPoints,
        track: selectedTrack.id,
        difficulty: selectedTrack.difficulty,
      });
      setEvaluation(result);
      setSessionScores(prev => [...prev, result.overall_score]);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 422 && detail) {
        setEvaluationError(detail);
      } else {
        setEvaluationError('Evaluation failed. Please check your connection and try again.');
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setEvaluation(null);
    setEvaluationError('');
    setShowHint(false);
  };

  return (
    <div className="space-y-6">

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
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
            Practice domain-specific technical questions. Your answer is evaluated by Groq AI — give a thoughtful, detailed response to receive a meaningful score.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-center min-w-[130px]">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Session Avg</span>
            <span className="text-2xl font-bold text-emerald-400">
              {avgScore ? `${avgScore}/10` : '—'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {sessionScores.length} evaluated
            </span>
          </div>
        </div>
      </div>

      {/* ─── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Questions Attempted"
          value={sessionScores.length}
          subtitle="This session"
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Session Avg Score"
          value={avgScore ? `${avgScore}/10` : '—'}
          subtitle="Across evaluated answers"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Active Track"
          value={selectedTrack.category}
          subtitle={selectedTrack.title}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Min Answer Length"
          value={`${MIN_WORDS} words`}
          subtitle="Required for evaluation"
          icon={Target}
          color="amber"
        />
      </div>

      {/* ─── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Track Selector */}
        <div className="space-y-4">
          <Card title="Interview Tracks" subtitle="Select a focused question set">
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

          <Card title="Interview Tips" subtitle="Campus recruitment guidelines">
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Write at least <strong>50–100 words</strong> — a one-line answer signals surface-level knowledge.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>For DSA, always state <strong>time and space complexity</strong> explicitly (e.g. O(N) time, O(1) space).</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>For behavioral rounds, structure answers using <strong>STAR: Situation, Task, Action, Result</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Scores are evaluated by <strong>Groq AI</strong> against expected key points — scores reflect actual answer quality.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Question & Evaluation Console */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title={`Active Question (${(questionIndex % currentQuestions.length) + 1} of ${currentQuestions.length})`}
            subtitle={selectedTrack.title}
            action={
              <Button variant="ghost" size="sm" onClick={handleNextQuestion} disabled={isEvaluating}>
                Skip
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            <div className="space-y-4">

              {/* Question Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Interview Prompt:</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                  {currentQ.q}
                </p>
                {showHint && currentQ.hint && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700 dark:text-slate-300">Strategy Hint:</strong> {currentQ.hint}</span>
                  </div>
                )}
                {!showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="mt-2 text-[11px] text-slate-400 hover:text-amber-500 underline underline-offset-2 transition-colors"
                  >
                    Show hint
                  </button>
                )}
              </div>

              {/* Answer Editor */}
              <form onSubmit={handleEvaluate} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Your Response:
                    </label>
                    <span className={`text-[11px] font-medium ${
                      wordCount === 0 ? 'text-slate-400'
                      : wordCount < MIN_WORDS ? 'text-rose-500'
                      : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {wordCount} / {MIN_WORDS} words min
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setEvaluationError('');
                    }}
                    disabled={isEvaluating}
                    placeholder={`Write a detailed, structured answer (at least ${MIN_WORDS} words).\n\nFor DSA: include complexity analysis.\nFor Behavioral: use STAR format.\nFor System Design: cover scalability and trade-offs.`}
                    className={`w-full bg-white dark:bg-slate-900 border rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none disabled:opacity-50 ${
                      evaluationError
                        ? 'border-rose-400 dark:border-rose-600'
                        : wordCount > 0 && wordCount < MIN_WORDS
                          ? 'border-amber-400 dark:border-amber-600'
                          : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>

                {/* Minimum-word warning */}
                {wordCount > 0 && wordCount < MIN_WORDS && !isGibberish && !evaluationError && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Write at least <strong>{MIN_WORDS} words</strong> before submitting — {MIN_WORDS - wordCount} more needed.</span>
                  </div>
                )}

                {/* Gibberish / Random characters warning */}
                {isGibberish && wordCount >= 3 && !evaluationError && (
                  <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Response contains random characters or repetitive words. Enter a meaningful explanation to be evaluated.</span>
                  </div>
                )}

                {/* API error */}
                {evaluationError && (
                  <div className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{evaluationError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setUserAnswer(''); setEvaluationError(''); setEvaluation(null); }}
                    disabled={!userAnswer || isEvaluating}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!isAnswerValid || isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Evaluating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Evaluate Answer
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* ─── Evaluation Result ─────────────────────────────────────── */}
              {evaluation && (
                <div className="mt-4 rounded-xl border border-blue-200 dark:border-blue-900/60 overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        AI Evaluator Result
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        via {evaluation.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {evaluation.overall_score === 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          Zero Marks
                        </span>
                      )}
                      <div className={`text-lg font-black ${
                        evaluation.overall_score >= 8 ? 'text-emerald-600 dark:text-emerald-400'
                        : evaluation.overall_score >= 6 ? 'text-blue-600 dark:text-blue-400'
                        : evaluation.overall_score >= 4 ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {evaluation.overall_score} / 10
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 space-y-4">

                    {/* Score dimensions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[evaluation.technical_depth, evaluation.clarity, evaluation.completeness].map(dim => dim && (
                        <div key={dim.label} className="bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{dim.label}</span>
                            <GradeBadge grade={dim.grade} />
                          </div>
                          <ScoreBar score={dim.score} />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{dim.comment}</p>
                        </div>
                      ))}
                    </div>

                    {/* Key-point coverage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Matched */}
                      {evaluation.matched_key_points?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1 mb-1.5">
                            <CheckCircle2 className="w-3 h-3" /> Covered ({evaluation.matched_key_points.length})
                          </span>
                          <ul className="space-y-1">
                            {evaluation.matched_key_points.map((kp, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{kp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Missing */}
                      {evaluation.missing_key_points?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1 mb-1.5">
                            <XCircle className="w-3 h-3" /> Missing ({evaluation.missing_key_points.length})
                          </span>
                          <ul className="space-y-1">
                            {evaluation.missing_key_points.map((kp, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                                <span>{kp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Strengths & Improvements */}
                    {((evaluation.strengths?.length > 0) || (evaluation.improvements?.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        {evaluation.strengths?.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase block mb-1.5">What You Did Well</span>
                            <ul className="space-y-1">
                              {evaluation.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                  <TrendingUp className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evaluation.improvements?.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block mb-1.5">Areas to Improve</span>
                            <ul className="space-y-1">
                              {evaluation.improvements.map((imp, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                  <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Summary */}
                    {evaluation.summary && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Evaluator Summary</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{evaluation.summary}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <Button variant="primary" size="sm" onClick={handleNextQuestion}>
                        Next Question
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
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
