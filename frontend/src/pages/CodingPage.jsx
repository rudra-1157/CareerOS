import React, { useState, useEffect } from 'react';
import { codingService } from '../services/api';
import { useModal } from '../context/ModalContext';
import { useCareer } from '../context/CareerContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

const EMPTY_CHALLENGE = {
  id: "empty",
  title: "",
  difficulty: "Custom",
  xp: 0,
  category: "",
  tags: [],
  description: "Create a new problem or select one from the directory.",
  starter_code: {
    python: "",
    javascript: "",
    cpp: ""
  },
  test_cases: []
};

const CodingPage = () => {
  const { openModal } = useModal();
  const { refreshStudentData } = useCareer();
  
  // Data State
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(EMPTY_CHALLENGE);
  const [activeLanguage, setActiveLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'testcases' | 'input' | 'result' | 'submissions'
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  
  // Execution & Submissions State
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Stats State (all real numbers from DB)
  const [stats, setStats] = useState({
    solved_count: 0,
    total_submissions: 0,
    total_xp: "0 XP",
    streak_days: "0 Days",
    batch_rank: "—",
    percentile: "Start your practice"
  });

  // Custom Challenge Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChallengeForm, setNewChallengeForm] = useState({
    title: '',
    category: 'Algorithms',
    difficulty: 'Easy',
    xp: 100,
    description: '',
    tags: 'Array, Logic',
    starterPython: '# Write function here\ndef solve():\n    pass',
    customInput: 'nums = [1, 2, 3]',
    expectedOutput: '6'
  });

  // Load challenges and stats on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [chList, statsData, subsData] = await Promise.all([
        codingService.getChallenges(),
        codingService.getStats(),
        codingService.getSubmissions()
      ]);
      
      if (Array.isArray(chList) && chList.length > 0) {
        setChallenges(chList);
        // Default to first challenge
        const first = chList[0];
        setSelectedChallenge(first);
        const starter = first.starter_code?.[activeLanguage] || Object.values(first.starter_code || {})[0] || '';
        setCode(starter);
      }
      if (statsData) {
        setStats(statsData);
      }
      if (Array.isArray(subsData)) {
        setSubmissions(subsData);
      }
    } catch {
      // Backend fallback
    }
  };

  const handleSelectChallenge = (ch) => {
    setSelectedChallenge(ch);
    const starter = ch.starter_code?.[activeLanguage] || ch.starter_code?.python || `// Code for ${ch.title}\n`;
    setCode(starter);
    setTestResults(null);
    setActiveTab('description');
  };

  const handleBlankWorkspace = () => {
    const blank = {
      id: `custom-${Date.now()}`,
      title: 'Custom Problem',
      difficulty: 'Custom',
      xp: 100,
      category: 'User Custom Code',
      tags: ['Custom Problem'],
      description: 'Enter your custom problem description or requirements here...',
      starter_code: {
        python: '# Enter your custom Python solution here\n',
        javascript: '// Enter your custom JavaScript solution here\n',
        cpp: '// Enter your custom C++ solution here\n'
      },
      test_cases: []
    };
    setSelectedChallenge(blank);
    setCode(blank.starter_code[activeLanguage] || '');
    setCustomInput('');
    setTestResults(null);
    setActiveTab('description');
    triggerToast("Switched to clean custom problem workspace.");
  };

  const handleLanguageChange = (lang) => {
    setActiveLanguage(lang);
    if (selectedChallenge.starter_code?.[lang]) {
      setCode(selectedChallenge.starter_code[lang]);
    }
  };

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('result');
    try {
      const res = await codingService.runCode({
        challenge_id: selectedChallenge.id,
        language: activeLanguage,
        code,
        custom_input: customInput
      });

      setTestResults({
        passed: res.passed,
        status: res.status,
        runtime: res.runtime,
        memory: res.memory,
        output: res.output
      });

      triggerToast(
        res.passed ? "Code executed successfully!" : `Execution result: ${res.status}`,
        res.passed ? "success" : "error"
      );
    } catch (err) {
      setTestResults({
        passed: 0,
        status: "Error",
        runtime: "0 ms",
        memory: "0 MB",
        output: err.response?.data?.detail || err.message || "Failed to execute code."
      });
      triggerToast("Failed to run code.", "error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    try {
      const res = await codingService.submitCode({
        challenge_id: selectedChallenge.id,
        language: activeLanguage,
        code,
        challenge_title: selectedChallenge.title
      });

      const submissionData = res.data;

      setTestResults({
        passed: submissionData.status === "Accepted" ? 1 : 0,
        status: submissionData.status,
        runtime: submissionData.runtime,
        memory: submissionData.memory,
        output: submissionData.output || `Status: ${submissionData.status}\nXP Awarded: +${submissionData.xp_awarded} XP`
      });
      setActiveTab('result');

      // Update real stats state immediately
      setStats(prev => ({
        ...prev,
        solved_count: submissionData.solved_count,
        total_xp: `${submissionData.total_xp} XP`,
        streak_days: `${submissionData.streak_days} Days`
      }));

      // Refresh global user state & refresh submissions
      if (refreshStudentData) refreshStudentData();
      const updatedSubs = await codingService.getSubmissions();
      if (Array.isArray(updatedSubs)) setSubmissions(updatedSubs);

      if (submissionData.status === "Accepted") {
        triggerToast(`🎉 Solved! +${submissionData.xp_awarded} XP awarded to your Skill Passport.`);
        openModal(
          "🎉 Challenge Solved!",
          `Congratulations! Your solution for "${selectedChallenge.title}" was accepted.\n\n• XP Awarded: +${submissionData.xp_awarded} XP\n• Runtime: ${submissionData.runtime}\n• Total Coding XP: ${submissionData.total_xp} XP\n• Practice Streak: ${submissionData.streak_days} Day(s)\n\nThis evidence has been stored in your verified ledger.`
        );
      } else {
        triggerToast(`Submission ${submissionData.status}. Review error in Output.`, "error");
      }
    } catch (err) {
      triggerToast(err.response?.data?.detail || "Submission failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomChallenge = async (e) => {
    e.preventDefault();
    if (!newChallengeForm.title.trim()) return;

    try {
      const payload = {
        title: newChallengeForm.title.trim(),
        category: newChallengeForm.category,
        difficulty: newChallengeForm.difficulty,
        xp: parseInt(newChallengeForm.xp) || 100,
        description: newChallengeForm.description.trim() || "User-defined problem specification.",
        tags: newChallengeForm.tags.split(',').map(s => s.trim()),
        starter_code: {
          python: newChallengeForm.starterPython,
          javascript: `// Solution for ${newChallengeForm.title}\nfunction solve() {\n}\n`,
          cpp: `// Solution for ${newChallengeForm.title}\nvoid solve() {\n}\n`
        },
        test_cases: [
          { input: newChallengeForm.customInput, expected: newChallengeForm.expectedOutput }
        ]
      };

      const res = await codingService.createChallenge(payload);
      if (res.challenge) {
        setChallenges(prev => [res.challenge, ...prev]);
        setSelectedChallenge(res.challenge);
        setCode(res.challenge.starter_code?.python || '');
        setCustomInput(newChallengeForm.customInput);
        setShowCreateModal(false);
        triggerToast("Custom coding challenge created! You can now solve and submit it.");
      }
    } catch (err) {
      triggerToast(err.response?.data?.detail || "Could not create challenge", "error");
    }
  };

  const filteredChallenges = filterDifficulty === 'All'
    ? challenges
    : challenges.filter(c => (c.difficulty || '').toLowerCase() === filterDifficulty.toLowerCase());

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      {/* Header Metrics (All dynamic from DB, 0 empty states) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Problems Solved"
          value={stats.solved_count}
          subtitle={stats.solved_count > 0 ? `${stats.total_submissions} total attempts` : "Start your first problem"}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Batch Ranking"
          value={stats.batch_rank}
          subtitle={stats.percentile}
          icon="🏆"
          color="blue"
        />
        <StatCard
          title="Total Coding XP"
          value={stats.total_xp}
          subtitle="Real earned XP in database"
          icon="⚡"
          color="purple"
        />
        <StatCard
          title="Practice Streak"
          value={stats.streak_days}
          subtitle="Continuous activity"
          icon="🔥"
          color="orange"
        />
      </div>

      {/* Main Coding Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Coding Arena Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="p-0" className="overflow-hidden border border-[#d9deea] shadow-sm">
            
            {/* Editor Top Bar */}
            <div className="bg-[#101a3b] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#233567]">
              <div className="flex items-center gap-3">
                <span className="text-xl">💻</span>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedChallenge.title}
                      onChange={(e) => setSelectedChallenge(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter Problem Title..."
                      className="bg-transparent border-b border-white/20 hover:border-white/50 focus:border-blue-400 text-base font-extrabold text-white tracking-tight outline-none px-1"
                    />
                    {selectedChallenge.solved && (
                      <span className="text-xs bg-[#10b981]/20 text-[#34d399] px-2 py-0.5 rounded-full font-bold">✓ Solved</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={selectedChallenge.difficulty === 'Easy' ? 'success' : selectedChallenge.difficulty === 'Medium' ? 'warning' : 'danger'}>
                      {selectedChallenge.difficulty}
                    </Badge>
                    <span className="text-xs text-[#9eb0d7] font-semibold">+{selectedChallenge.xp} XP</span>
                  </div>
                </div>
              </div>

              {/* Language Selector & New Problem CTA */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#9eb0d7] font-medium">Language:</label>
                <select
                  value={activeLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#1b2b5a] text-white border border-[#334b82] rounded-lg text-xs px-2.5 py-1 focus:outline-none focus:border-[#4f78ff]"
                >
                  <option value="python">Python 3.14</option>
                  <option value="javascript">JavaScript (Node 20)</option>
                  <option value="cpp">C++ 20 (Syntax Check)</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBlankWorkspace}
                  className="border-blue-400/30 text-blue-300 hover:bg-blue-900/30 text-xs font-semibold py-1"
                >
                  ➕ Blank Problem
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  className="border-white/20 text-white hover:bg-white/10 text-xs font-semibold py-1 ml-1"
                >
                  ⚙️ Create Spec
                </Button>
              </div>
            </div>

            {/* Problem Tab Selector */}
            <div className="bg-[#f8f9fc] border-b border-[#e5e9f1] px-5 py-2.5 flex flex-wrap gap-4 text-xs font-bold text-[#68738a]">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-1 transition-all ${
                  activeTab === 'description'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                📖 Description
              </button>
              <button
                onClick={() => setActiveTab('testcases')}
                className={`pb-1 transition-all ${
                  activeTab === 'testcases'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                🧪 Test Cases
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={`pb-1 transition-all ${
                  activeTab === 'input'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                ✏️ Custom Input
              </button>
              <button
                onClick={() => setActiveTab('result')}
                className={`pb-1 transition-all ${
                  activeTab === 'result'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                ⚡ Output {testResults ? `(${testResults.status})` : ''}
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`pb-1 transition-all ${
                  activeTab === 'submissions'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                📜 My Submissions ({submissions.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 bg-white border-b border-[#e5e9f1] text-sm min-h-[140px] max-h-[220px] overflow-y-auto">
              
              {/* Description */}
              {activeTab === 'description' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#68738a] font-semibold">
                    <span>Problem Statement / Notes:</span>
                    <span className="text-[11px] text-blue-500">Editable (Type directly below)</span>
                  </div>
                  <textarea
                    rows={3}
                    value={selectedChallenge.description}
                    onChange={(e) => setSelectedChallenge(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Type problem description, problem statement, or instructions here..."
                    className="w-full text-xs md:text-sm text-[#334155] p-2.5 bg-[#f8f9fc] border border-[#e2e8f0] rounded-lg outline-none focus:border-[#315bdc] resize-y font-normal"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedChallenge.tags || ["Algorithm"]).map((t, idx) => (
                      <span key={idx} className="text-[11px] bg-[#f1f4fa] text-[#475569] px-2 py-0.5 rounded font-medium">
                        🏷️ {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Test cases */}
              {activeTab === 'testcases' && (
                <div className="space-y-2.5">
                  {(selectedChallenge.test_cases || [
                    { input: "Custom input test case", expected: "Output" }
                  ]).map((tc, idx) => (
                    <div key={idx} className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-xs font-mono">
                      <div className="text-[#68738a] font-bold mb-1">Case {idx + 1}:</div>
                      <div className="text-[#172033]">Input: {tc.input}</div>
                      <div className="text-[#15966b]">Expected: {tc.expected}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Input */}
              {activeTab === 'input' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#172033]">
                      User Custom Input (Passed directly to standard input / execution):
                    </label>
                    <span className="text-[11px] text-[#68738a]">You can enter any data according to your tests</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input arguments or lines here..."
                    className="w-full font-mono text-xs p-3 bg-[#f8f9fc] border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                  />
                </div>
              )}

              {/* Execution Result */}
              {activeTab === 'result' && (
                <div className="space-y-3">
                  {testResults ? (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                      testResults.passed
                        ? 'bg-[#e7f7f0] border-[#a3e0c7]'
                        : 'bg-[#fff1f2] border-[#fecdd3]'
                    }`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className={testResults.passed ? 'text-[#11825c]' : 'text-[#be123c]'}>
                          {testResults.passed ? '✓' : '✕'} Status: {testResults.status}
                        </span>
                        <span className="text-[#68738a] font-mono">Runtime: {testResults.runtime} • Memory: {testResults.memory}</span>
                      </div>
                      <div className="font-mono bg-white p-3 rounded-lg border border-[#e2e8f0] text-[#172033] whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {testResults.output}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#94a3b8]">
                      Click <b className="text-[#172033]">"Run Code"</b> or <b className="text-[#172033]">"Submit Solution"</b> to execute your code in real-time.
                    </div>
                  )}
                </div>
              )}

              {/* Submissions History */}
              {activeTab === 'submissions' && (
                <div className="space-y-2">
                  {submissions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#94a3b8]">
                      No previous submissions recorded for this account. Submit a solution to start your history!
                    </div>
                  ) : (
                    <div className="divide-y divide-[#edf0f5]">
                      {submissions.map((sub, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#172033] block">{sub.challenge_title}</span>
                            <span className="text-[11px] text-[#68738a] font-mono">
                              {sub.language} • {sub.runtime} • {sub.submitted_at}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sub.status === 'Accepted' ? 'bg-[#e7f7f0] text-[#11825c]' : 'bg-[#fff1f2] text-[#be123c]'
                            }`}>
                              {sub.status}
                            </span>
                            {sub.xp_awarded > 0 && (
                              <span className="text-[11px] font-bold text-[#315bdc]">+{sub.xp_awarded} XP</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Monospaced Code Editor */}
            <div className="p-4 bg-[#0d1424]">
              <div className="flex justify-between items-center text-xs text-[#7184aa] mb-2 px-1">
                <span>Code Editor ({activeLanguage})</span>
                <span>Type or edit according to your needs</span>
              </div>
              <textarea
                rows={13}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="w-full bg-[#0a0f1d] text-[#e2e8f0] font-mono text-xs p-4 rounded-xl border border-[#233567] focus:outline-none focus:border-[#3b82f6] leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-[#f8f9fc] border-t border-[#e5e9f1] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('input')}
                  className="text-xs"
                >
                  ✏️ Edit Custom Input
                </Button>
                <span className="text-xs text-[#68738a] hidden sm:inline">
                  Input: <code className="bg-[#edf2ff] text-[#315bdc] px-1.5 py-0.5 rounded font-mono">{customInput ? customInput.slice(0, 20) + (customInput.length > 20 ? '...' : '') : '(none)'}</code>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="font-bold text-xs"
                >
                  {isRunning ? 'Running in Sandbox...' : '▶ Run Code'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="font-bold text-xs shadow-md"
                >
                  {isSubmitting ? 'Evaluating...' : '🚀 Submit Solution'}
                </Button>
              </div>
            </div>

          </Card>
        </div>

        {/* Right Column: Challenges List & Filter */}
        <div className="space-y-6">
          <Card
            title="Problem Directory"
            subtitle="Curated benchmarks & user-created challenges"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="text-[#315bdc] font-bold text-xs"
              >
                ➕ Add New
              </Button>
            }
          >
            {/* Difficulty Filter */}
            <div className="flex gap-2 mb-4">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterDifficulty === diff
                      ? 'bg-[#315bdc] text-white'
                      : 'bg-[#f8f9fc] text-[#68738a] hover:bg-[#edf2ff] hover:text-[#315bdc]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredChallenges.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedChallenge.id === ch.id
                      ? 'bg-[#edf2ff] border-[#315bdc] shadow-sm'
                      : 'bg-[#f8f9fc] border-[#e5e9f1] hover:border-[#ccd6e8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#172033] flex items-center gap-1.5">
                      {ch.title}
                      {ch.solved && <span className="text-[10px] text-[#11825c] font-bold">✓</span>}
                    </span>
                    <Badge variant={ch.difficulty === 'Easy' ? 'success' : ch.difficulty === 'Medium' ? 'warning' : 'danger'}>
                      {ch.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#68738a]">
                    <span>{ch.category}</span>
                    <span className="font-bold text-[#315bdc]">+{ch.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Arena Guidelines">
            <ul className="text-xs text-[#475569] space-y-2 list-disc pl-4 leading-relaxed">
              <li>You can supply arbitrary arguments in the <b>Custom Input</b> tab to test custom scenarios.</li>
              <li>When you click <b>Submit Solution</b>, real execution records and verified XP are awarded directly to your Skill Passport.</li>
              <li>You can use the <b>Create Problem</b> button to register your own custom problem specifications.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Create Custom Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e9f1] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#edf0f5] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#172033]">Create Custom Coding Problem</h3>
                <p className="text-xs text-[#68738a]">Specify your own problem, test cases, and inputs</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#68738a] hover:text-[#172033] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomChallenge} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#172033] mb-1">Problem Title *</label>
                <input
                  type="text"
                  required
                  value={newChallengeForm.title}
                  onChange={(e) => setNewChallengeForm({ ...newChallengeForm, title: e.target.value })}
                  placeholder="e.g. Reverse Linked List or Matrix Spiral Traversal"
                  className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Category</label>
                  <input
                    type="text"
                    value={newChallengeForm.category}
                    onChange={(e) => setNewChallengeForm({ ...newChallengeForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Difficulty</label>
                  <select
                    value={newChallengeForm.difficulty}
                    onChange={(e) => setNewChallengeForm({ ...newChallengeForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">XP Value</label>
                  <input
                    type="number"
                    value={newChallengeForm.xp}
                    onChange={(e) => setNewChallengeForm({ ...newChallengeForm, xp: e.target.value })}
                    className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  value={newChallengeForm.description}
                  onChange={(e) => setNewChallengeForm({ ...newChallengeForm, description: e.target.value })}
                  placeholder="Describe inputs, outputs and constraints..."
                  className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Sample Custom Input</label>
                  <input
                    type="text"
                    value={newChallengeForm.customInput}
                    onChange={(e) => setNewChallengeForm({ ...newChallengeForm, customInput: e.target.value })}
                    placeholder="e.g. nums = [1, 2, 3]"
                    className="w-full px-3 py-2 border border-[#d9deea] rounded-xl font-mono text-xs focus:outline-none focus:border-[#315bdc]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172033] mb-1">Expected Output</label>
                  <input
                    type="text"
                    value={newChallengeForm.expectedOutput}
                    onChange={(e) => setNewChallengeForm({ ...newChallengeForm, expectedOutput: e.target.value })}
                    placeholder="e.g. 6"
                    className="w-full px-3 py-2 border border-[#d9deea] rounded-xl font-mono text-xs focus:outline-none focus:border-[#315bdc]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Starter Code (Python)</label>
                <textarea
                  rows={3}
                  value={newChallengeForm.starterPython}
                  onChange={(e) => setNewChallengeForm({ ...newChallengeForm, starterPython: e.target.value })}
                  className="w-full px-3 py-2 border border-[#d9deea] rounded-xl font-mono text-xs focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#edf0f5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold"
                >
                  Save & Start Solving
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CodingPage;
