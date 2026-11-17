import React, { useState } from 'react';
import { 
  Play, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  FileCode, 
  Search, 
  Filter, 
  Code2, 
  RotateCcw,
  Sparkles,
  Clock
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { codingService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PRACTICE_PROBLEMS = [
  {
    id: 'PRAC-01',
    title: 'Array Running Prefix Accumulator',
    category: 'Arrays',
    difficulty: 'Easy',
    xp: 60,
    description: 'Construct a function that receives a sequence of integers and returns an array where each position contains the running cumulative sum of elements up to that index.',
    sampleInput: 'nums = [1, 2, 3, 4]',
    expectedOutput: '[1, 3, 6, 10]',
    starterCode: {
      python: "def running_sum(nums):\n    # Return the cumulative sum array\n    result = []\n    current = 0\n    for n in nums:\n        current += n\n        result.append(current)\n    return result\n",
      javascript: "function runningSum(nums) {\n    let current = 0;\n    return nums.map(n => current += n);\n}\n",
      cpp: "#include <vector>\nusing namespace std;\n\nvector<int> runningSum(vector<int>& nums) {\n    for (int i = 1; i < nums.size(); i++) nums[i] += nums[i - 1];\n    return nums;\n}\n"
    }
  },
  {
    id: 'PRAC-02',
    title: 'Balanced Token Sequence Validator',
    category: 'Strings',
    difficulty: 'Easy',
    xp: 80,
    description: 'Given a string containing bracket symbols, determine if the input sequence is syntactically balanced according to proper opening and closing order.',
    sampleInput: "tokens = '({[]})'",
    expectedOutput: 'True',
    starterCode: {
      python: "def is_balanced(tokens):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in tokens:\n        if char in mapping.values():\n            stack.append(char)\n        elif char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n    return len(stack) == 0\n",
      javascript: "function isBalanced(tokens) {\n    const stack = [];\n    // Implement balance check\n    return true;\n}\n",
      cpp: "#include <string>\nusing namespace std;\n\nbool isBalanced(string tokens) {\n    // Implement\n    return true;\n}\n"
    }
  },
  {
    id: 'PRAC-03',
    title: 'Matrix Cost Minimization Path',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    xp: 120,
    description: 'Given an m x n numerical grid populated with traversal costs, compute a path from top-left to bottom-right that minimizes the total accumulated traversal cost.',
    sampleInput: 'grid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]]',
    expectedOutput: '7',
    starterCode: {
      python: "def min_cost_path(grid):\n    m, n = len(grid), len(grid[0])\n    dp = [[0] * n for _ in range(m)]\n    dp[0][0] = grid[0][0]\n    # Fill DP table\n    return dp[-1][-1]\n",
      javascript: "function minCostPath(grid) {\n    // Implement DP path cost\n    return 0;\n}\n",
      cpp: "#include <vector>\nusing namespace std;\n\nint minCostPath(vector<vector<int>>& grid) {\n    return 0;\n}\n"
    }
  },
  {
    id: 'PRAC-04',
    title: 'Binary Tree Branch Sum Aggregator',
    category: 'Trees',
    difficulty: 'Medium',
    xp: 110,
    description: 'Calculate the total sum of all root-to-leaf paths in a binary tree where path nodes represent numeric values.',
    sampleInput: 'tree_nodes = [4, 9, 0, 5, 1]',
    expectedOutput: '1026',
    starterCode: {
      python: "def sum_branch_paths(root):\n    # Traverse paths and calculate sum\n    return 0\n",
      javascript: "function sumBranchPaths(root) {\n    return 0;\n}\n",
      cpp: "int sumBranchPaths(void* root) {\n    return 0;\n}\n"
    }
  },
  {
    id: 'PRAC-05',
    title: 'Directed Graph Cycle Verifier',
    category: 'Graphs',
    difficulty: 'Hard',
    xp: 180,
    description: 'Analyze an adjacency representation of a directed network to determine whether a cyclic dependency exists within the component nodes.',
    sampleInput: 'num_nodes = 4, edges = [[0, 1], [1, 2], [2, 0]]',
    expectedOutput: 'True (Cycle Detected)',
    starterCode: {
      python: "def has_cycle(num_nodes, edges):\n    # Detect cycle via topological sort or DFS graph coloring\n    return True\n",
      javascript: "function hasCycle(numNodes, edges) {\n    return true;\n}\n",
      cpp: "#include <vector>\nusing namespace std;\n\nbool hasCycle(int numNodes, vector<vector<int>>& edges) {\n    return true;\n}\n"
    }
  }
];

const PracticeTab = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { addToast } = useToast();

  const [selectedProblem, setSelectedProblem] = useState(PRACTICE_PROBLEMS[0]);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(PRACTICE_PROBLEMS[0].starterCode.python);

  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // testcases, submissions
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([
    { id: 'SUB-101', problem: 'Array Running Prefix Accumulator', status: 'Accepted', runtime: '34ms', memory: '16.4MB', timestamp: 'Yesterday' }
  ]);

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode[language] || prob.starterCode.python);
    setTestResults(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(selectedProblem.starterCode[lang] || selectedProblem.starterCode.python);
  };

  const filteredProblems = PRACTICE_PROBLEMS.filter(p => {
    const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiff && matchCat && matchSearch;
  });

  const handleRunTest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults({
        passed: true,
        runtime: '28ms',
        memory: '15.8MB',
        input: selectedProblem.sampleInput,
        expected: selectedProblem.expectedOutput,
        actual: selectedProblem.expectedOutput
      });
      addToast({
        type: 'success',
        title: 'Tests Passed',
        message: 'Sample test case matched expected output.'
      });
    }, 500);
  };

  const handleSubmitSolution = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newSub = {
        id: `SUB-${Date.now().toString().slice(-4)}`,
        problem: selectedProblem.title,
        status: 'Accepted',
        runtime: '32ms',
        memory: '16.1MB',
        timestamp: 'Just now'
      };
      setSubmissionHistory(prev => [newSub, ...prev]);
      setActiveConsoleTab('submissions');

      // Update XP
      if (currentUser?.learning_xp !== undefined) {
        updateCurrentUser({ learning_xp: (currentUser.learning_xp || 0) + selectedProblem.xp });
      }

      addToast({
        type: 'success',
        title: 'Solution Accepted!',
        message: `Awarded +${selectedProblem.xp} XP for solving ${selectedProblem.title}!`
      });
    }, 700);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Problem Directory Filter Bar */}
      <div 
        className="rounded-2xl p-4 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Difficulty pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  difficultyFilter === d ? 'shadow-2xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: difficultyFilter === d ? 'var(--color-card-bg)' : 'transparent',
                  color: difficultyFilter === d ? 'var(--color-primary-accent)' : 'var(--color-text-main)'
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border focus:outline-none"
            style={{
              backgroundColor: 'var(--color-secondary-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            <option value="All">All Categories</option>
            <option value="Arrays">Arrays</option>
            <option value="Strings">Strings</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Trees">Trees</option>
            <option value="Graphs">Graphs</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problem title..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none"
            style={{
              backgroundColor: 'var(--color-secondary-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          />
        </div>
      </div>

      {/* Main Workspace: Problem List (Left) + Editor & Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Problem List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {filteredProblems.map((prob) => {
            const isSelected = selectedProblem.id === prob.id;
            return (
              <div
                key={prob.id}
                onClick={() => handleSelectProblem(prob)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected ? 'ring-2' : 'hover:border-slate-400'
                }`}
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: isSelected ? 'var(--color-primary-accent)' : 'var(--color-card-border)',
                  color: 'var(--color-text-main)',
                  outlineColor: 'var(--color-primary-accent)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      prob.difficulty === 'Easy' ? 'bg-emerald-500/15 text-emerald-500' :
                      prob.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-500' :
                      'bg-rose-500/15 text-rose-500'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-primary-accent)' }}>
                    +{prob.xp} XP
                  </span>
                </div>

                <h4 className="font-semibold text-xs leading-snug">{prob.title}</h4>
                <span className="text-[10px] font-mono block" style={{ color: 'var(--color-text-muted)' }}>
                  {prob.category}
                </span>
              </div>
            );
          })}
        </div>

        {/* Problem Spec & Code Editor (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Problem Header Spec */}
          <div 
            className="rounded-2xl p-5 border shadow-sm space-y-3"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{selectedProblem.title}</h3>
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                {selectedProblem.id}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {selectedProblem.description}
            </p>

            <div 
              className="p-3 rounded-xl border font-mono text-xs space-y-1"
              style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Sample Input: </span>
                <span className="font-semibold">{selectedProblem.sampleInput}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Expected Output: </span>
                <span style={{ color: 'var(--color-primary-accent)' }}>{selectedProblem.expectedOutput}</span>
              </div>
            </div>
          </div>

          {/* Editor Container */}
          <div 
            className="rounded-2xl border shadow-sm overflow-hidden"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            {/* Toolbar */}
            <div 
              className="px-4 py-2.5 border-b flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <FileCode className="w-4 h-4" style={{ color: 'var(--color-primary-accent)' }} />
                <span>Code Editor</span>
              </div>

              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border font-mono focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-text-main)'
                }}
              >
                <option value="python">Python 3.11</option>
                <option value="javascript">JavaScript (ES6)</option>
                <option value="cpp">C++ 17</option>
              </select>
            </div>

            {/* Editor Area */}
            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-100 min-h-[280px]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                rows={12}
                className="w-full bg-transparent text-emerald-400 font-mono text-xs resize-none focus:outline-none leading-relaxed"
              />
            </div>

            {/* Run & Submit Action Row */}
            <div 
              className="p-3.5 border-t flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                Time limit: 2.0s
              </span>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunTest}
                  disabled={isRunning || isSubmitting}
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || isRunning}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
                </Button>
              </div>
            </div>
          </div>

          {/* Test & Submissions Console */}
          <div 
            className="rounded-2xl border shadow-sm overflow-hidden"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            {/* Console Header Tabs */}
            <div 
              className="px-4 py-2 border-b flex items-center gap-4 text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <button
                onClick={() => setActiveConsoleTab('testcases')}
                className={`py-1 border-b-2 font-mono transition-colors ${
                  activeConsoleTab === 'testcases' ? 'border-emerald-500 text-emerald-500' : 'border-transparent opacity-70'
                }`}
              >
                Test Output
              </button>
              <button
                onClick={() => setActiveConsoleTab('submissions')}
                className={`py-1 border-b-2 font-mono transition-colors ${
                  activeConsoleTab === 'submissions' ? 'border-emerald-500 text-emerald-500' : 'border-transparent opacity-70'
                }`}
              >
                Submissions History ({submissionHistory.length})
              </button>
            </div>

            {/* Tab 1: Test Output */}
            {activeConsoleTab === 'testcases' && (
              <div className="p-4 font-mono text-xs space-y-2">
                {testResults ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Test Executed Successfully ({testResults.runtime})</span>
                    </div>
                    <div 
                      className="p-3 rounded-xl border text-[11px] space-y-1"
                      style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                    >
                      <div>Input: {testResults.input}</div>
                      <div>Expected: {testResults.expected}</div>
                      <div className="text-emerald-500 font-bold">Actual: {testResults.actual}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Press 'Run Code' to execute your code against sample assertions.
                  </span>
                )}
              </div>
            )}

            {/* Tab 2: Submissions History */}
            {activeConsoleTab === 'submissions' && (
              <div className="divide-y text-xs font-mono" style={{ borderColor: 'var(--color-card-border)' }}>
                {submissionHistory.map((sub) => (
                  <div 
                    key={sub.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-emerald-500 block">{sub.status}</span>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{sub.problem}</span>
                      </div>
                    </div>
                    <div className="text-right text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      <div>{sub.runtime} • {sub.memory}</div>
                      <div className="text-[10px]">{sub.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PracticeTab;