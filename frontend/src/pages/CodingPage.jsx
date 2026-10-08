import React, { useState } from 'react';
import { initialCodingData } from '../data/initialData';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

const CodingPage = () => {
  const { openModal } = useModal();
  const [selectedChallenge, setSelectedChallenge] = useState(initialCodingData.todaysChallenge);
  const [activeLanguage, setActiveLanguage] = useState('python');
  const [code, setCode] = useState(initialCodingData.todaysChallenge.starterCode.python);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'testcases' | 'result'
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const challengesList = initialCodingData.challenges || [];
  const stats = initialCodingData.stats || {};

  const handleSelectChallenge = (ch) => {
    // If selected today's challenge or listed challenge
    const fullChallenge = {
      ...initialCodingData.todaysChallenge,
      id: ch.id,
      title: ch.title,
      difficulty: ch.difficulty,
      xp: `+${ch.xp} XP`,
      category: ch.category
    };
    setSelectedChallenge(fullChallenge);
    setCode(fullChallenge.starterCode?.[activeLanguage] || `// Solution for ${ch.title}\ndef solve():\n    pass`);
    setTestResults(null);
    setActiveTab('description');
  };

  const handleLanguageChange = (lang) => {
    setActiveLanguage(lang);
    if (selectedChallenge.starterCode?.[lang]) {
      setCode(selectedChallenge.starterCode[lang]);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults({
        passed: 3,
        total: 3,
        runtime: "42 ms",
        memory: "16.4 MB",
        status: "Accepted",
        output: "Test Case 1: [0, 1] (Match)\nTest Case 2: [1, 2] (Match)\nTest Case 3: [0, 1] (Match)"
      });
      setActiveTab('result');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const handleSubmitCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults({
        passed: 3,
        total: 3,
        runtime: "38 ms (Beats 94.2% of submissions)",
        memory: "16.2 MB",
        status: "Accepted",
        output: "All 28 hidden test cases passed successfully!\n+100 XP awarded to your Skill Passport."
      });
      setActiveTab('result');
      openModal(
        "🎉 Challenge Solved!",
        `Congratulations! You solved "${selectedChallenge.title}".\n\n• XP Awarded: +100 XP\n• Speed: 38 ms (Beats 94.2%)\n• Evidence added to your Skill Passport under DSA & Problem Solving.`
      );
    }, 900);
  };

  const filteredChallenges = filterDifficulty === 'All'
    ? challengesList
    : challengesList.filter(c => c.difficulty.toLowerCase() === filterDifficulty.toLowerCase());

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message="Code executed! All test cases passed."
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* Header Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Problems Solved"
          value={stats.solvedCount || 126}
          subtitle="34 this month"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Batch Ranking"
          value={stats.batchRank || "#17"}
          subtitle={stats.percentile || "Top 8% of CSE"}
          icon="🏆"
          color="blue"
        />
        <StatCard
          title="Total Coding XP"
          value={stats.totalXP || "4,250 XP"}
          subtitle="+450 XP this month"
          icon="⚡"
          color="purple"
        />
        <StatCard
          title="Active Streak"
          value={stats.streak || "12 Days"}
          subtitle="Daily Practice"
          icon="🔥"
          color="orange"
        />
      </div>

      {/* Main Coding Layout: Left Side Problem & Editor vs Right Challenges List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Coding Arena Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="p-0" className="overflow-hidden border border-[#d9deea]">
            {/* Editor Top Bar */}
            <div className="bg-[#101a3b] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#233567]">
              <div className="flex items-center gap-3">
                <span className="text-xl">💻</span>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">{selectedChallenge.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={selectedChallenge.difficulty === 'Easy' ? 'success' : selectedChallenge.difficulty === 'Medium' ? 'warning' : 'danger'}>
                      {selectedChallenge.difficulty}
                    </Badge>
                    <span className="text-xs text-[#9eb0d7] font-semibold">{selectedChallenge.xp}</span>
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#9eb0d7] font-medium">Language:</label>
                <select
                  value={activeLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#1b2b5a] text-white border border-[#334b82] rounded-lg text-xs px-2.5 py-1 focus:outline-none focus:border-[#4f78ff]"
                >
                  <option value="python">Python 3.11</option>
                  <option value="javascript">JavaScript (Node 20)</option>
                  <option value="cpp">C++ 20</option>
                </select>
              </div>
            </div>

            {/* Problem Tab Selector */}
            <div className="bg-[#f8f9fc] border-b border-[#e5e9f1] px-5 py-2 flex gap-4 text-xs font-bold text-[#68738a]">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-1 transition-all ${
                  activeTab === 'description'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                Problem Description
              </button>
              <button
                onClick={() => setActiveTab('testcases')}
                className={`pb-1 transition-all ${
                  activeTab === 'testcases'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                Sample Test Cases
              </button>
              <button
                onClick={() => setActiveTab('result')}
                className={`pb-1 transition-all ${
                  activeTab === 'result'
                    ? 'text-[#315bdc] border-b-2 border-[#315bdc]'
                    : 'hover:text-[#172033]'
                }`}
              >
                Execution Result {testResults && '✓'}
              </button>
            </div>

            {/* Tab Contents: Problem Description / Test Cases / Result */}
            <div className="p-5 bg-white border-b border-[#e5e9f1] text-sm">
              {activeTab === 'description' && (
                <div className="space-y-3">
                  <p className="text-[#334155] leading-relaxed whitespace-pre-line font-normal">
                    {selectedChallenge.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(selectedChallenge.tags || ["Array", "Hash Table"]).map((t, idx) => (
                      <span key={idx} className="text-xs bg-[#f1f4fa] text-[#475569] px-2.5 py-1 rounded-md font-medium">
                        🏷️ {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'testcases' && (
                <div className="space-y-2.5">
                  {(selectedChallenge.testCases || [
                    { input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]", status: "Passed" },
                    { input: "nums = [3,2,4], target = 6", expected: "[1, 2]", status: "Passed" }
                  ]).map((tc, idx) => (
                    <div key={idx} className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-xs font-mono">
                      <div className="text-[#68738a] font-bold mb-1">Case {idx + 1}:</div>
                      <div className="text-[#172033]">Input: {tc.input}</div>
                      <div className="text-[#15966b]">Expected: {tc.expected}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'result' && (
                <div className="space-y-3">
                  {testResults ? (
                    <div className="p-4 bg-[#e7f7f0] border border-[#a3e0c7] rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-center font-bold text-[#11825c] text-sm">
                        <span>✓ Status: {testResults.status}</span>
                        <span>Runtime: {testResults.runtime}</span>
                      </div>
                      <div className="font-mono bg-white p-3 rounded-lg border border-[#a3e0c7] text-[#172033] whitespace-pre-line">
                        {testResults.output}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#68738a]">Run your code or submit to view test runner feedback.</p>
                  )}
                </div>
              )}
            </div>

            {/* Code Textarea Editor UI */}
            <div className="bg-[#0f172a] p-4 text-white font-mono text-sm">
              <div className="text-xs text-[#94a3b8] mb-2 flex justify-between items-center">
                <span>// Write your solution below:</span>
                <button
                  onClick={() => setCode(selectedChallenge.starterCode?.[activeLanguage] || '')}
                  className="text-[11px] text-[#38bdf8] hover:underline font-mono"
                >
                  Reset Template
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                spellCheck="false"
                className="w-full bg-transparent text-[#e2e8f0] font-mono text-sm leading-relaxed focus:outline-none resize-y"
              />
            </div>

            {/* Bottom Actions */}
            <div className="bg-[#f8f9fc] px-5 py-3.5 flex items-center justify-between border-t border-[#e5e9f1]">
              <span className="text-xs text-[#68738a] font-medium">
                Auto-saved • Ready for evaluation
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  disabled={isRunning}
                  onClick={handleRunCode}
                  className="font-bold text-xs"
                >
                  {isRunning ? 'Running...' : '▶ Run Code'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isRunning}
                  onClick={handleSubmitCode}
                  className="font-bold text-xs shadow-md"
                >
                  {isRunning ? 'Evaluating...' : '🚀 Submit Solution'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Challenge Directory & Friend Arena */}
        <div className="space-y-6">
          
          {/* Friend Challenge Card */}
          <div className="bg-gradient-to-br from-[#101a3b] to-[#253d82] text-white rounded-2xl p-5 shadow-sm space-y-3 border border-[#233567]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9eb0d7]">⚔️ Friend Challenge</span>
              <Badge variant="warning">{initialCodingData.friendChallenge.badge}</Badge>
            </div>
            <h4 className="text-base font-extrabold text-white">
              {initialCodingData.friendChallenge.title}
            </h4>
            <p className="text-xs text-[#dce5ff]">
              Problem: <b>{initialCodingData.friendChallenge.problem}</b>
            </p>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => openModal(initialCodingData.friendChallenge.title, "Head-to-head friend battle mode: Both participants receive the same problem statement and 20-minute countdown. The system measures accuracy, time complexity, and memory efficiency.")}
              className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold text-xs"
            >
              Enter Match Room
            </Button>
          </div>

          {/* Challenge Directory with Filter */}
          <Card
            title="Curated Challenges"
            subtitle="Campus placement favorite problems"
          >
            {/* Filter Pills */}
            <div className="flex gap-1.5 mb-3.5">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterDifficulty === diff
                      ? 'bg-[#315bdc] text-white'
                      : 'bg-[#f1f4fa] text-[#68738a] hover:bg-[#e2e8f0]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredChallenges.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectChallenge(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedChallenge.title === item.title
                      ? 'bg-[#edf2ff] border-[#315bdc] shadow-sm'
                      : 'bg-[#f8f9fc] border-[#e5e9f1] hover:border-[#ccd6e8]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <span>{item.solved ? '✅' : '⚪'}</span>
                      <span>{item.title}</span>
                    </div>
                    <div className="text-[11px] text-[#68738a] mt-0.5">
                      {item.category} • Accuracy {item.accuracy}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.difficulty === 'Easy' ? 'success' : item.difficulty === 'Medium' ? 'warning' : 'danger'}>
                      {item.difficulty}
                    </Badge>
                    <div className="text-[10px] text-[#315bdc] font-bold mt-1">+{item.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
