import React, { useState, useRef, useEffect } from 'react';
import { initialMentorData } from '../data/initialData';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const MentorPage = () => {
  const { openModal } = useModal();
  const [messages, setMessages] = useState(initialMentorData.initialMessages);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedContext, setSelectedContext] = useState('All Resources');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleAsk = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'me',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI / RAG generation
    setTimeout(() => {
      let aiResponseText = '';
      const q = textToSend.toLowerCase();

      if (q.includes('rag')) {
        aiResponseText = "RAG (Retrieval-Augmented Generation) in CareerOS indexes approved institutional materials (course syllabi, lecture slides, and past year exams) into a vector database. When you ask a question, relevant chunks are retrieved and provided as authoritative context to the LLM to deliver grounded, syllabus-aligned answers.";
      } else if (q.includes('os') || q.includes('operating') || q.includes('process') || q.includes('viva')) {
        aiResponseText = "Based on your semester 3 Operating Systems syllabus (Unit 2: Process Synchronization):\n\n1. Critical Section Problem: A solution must satisfy Mutual Exclusion, Progress, and Bounded Waiting.\n2. Semaphores vs Mutex: A mutex is a locking mechanism (binary), while a semaphore is a signaling mechanism (counting/binary).\n3. Classic Viva Question: 'How does Peterson's solution avoid race conditions?' Answer: By using two variables: `flag[2]` and `turn`.";
      } else if (q.includes('dsa') || q.includes('graph') || q.includes('tree') || q.includes('roadmap')) {
        aiResponseText = "Here is your 4-Week Graph Algorithms Roadmap:\n\n• Week 1: Graph Representations (Adjacency Matrix vs List) + BFS & DFS traversals.\n• Week 2: Topological Sorting (Kahn's Algorithm) + Cycle Detection in Directed & Undirected graphs.\n• Week 3: Shortest Path Algorithms: Dijkstra (with Min-Heap priority queue) & Bellman-Ford.\n• Week 4: Minimum Spanning Trees (Kruskal's + Disjoint Set Union & Prim's Algorithm).";
      } else if (q.includes('ml') || q.includes('machine learning') || q.includes('project') || q.includes('recruiter')) {
        aiResponseText = "To make your Machine Learning projects recruiter-ready for AI/ML roles:\n\n1. End-to-End Pipeline: Don't just submit a Jupyter Notebook. Wrap model inference in a FastAPI service.\n2. Metrics & Benchmarks: Highlight latency benchmarks (e.g. '<35ms per batch') and validation accuracy / F1 score in your GitHub README.\n3. CI/CD: Include Docker containerization and a basic GitHub Actions workflow for automated tests.";
      } else {
        aiResponseText = `I analyzed your query: "${textToSend}" against your university syllabus and target goal (AI/ML Engineer). CareerOS recommends reviewing the related laboratory manuals and solving corresponding Coding Arena problems to turn this theoretical knowledge into verifiable skill evidence.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleClearChat = () => {
    setMessages([
      { id: Date.now(), sender: 'ai', text: 'Chat cleared. Ask me about your subjects, exam prep, or coding roadmap!', timestamp: 'Just now' }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff] mb-2">
            <span>📚 Context:</span>
            <span className="text-white font-bold">University Syllabi + AI Mentor</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">🤖 AI Learning Mentor</h2>
          <p className="text-sm text-[#dce5ff] mt-1">
            RAG-powered academic assistant indexed with your university course materials, lab manuals, and exam papers.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => openModal("RAG Architecture in CareerOS", "In CareerOS, institutional syllabi, textbooks, and past papers are chunked and converted into vector embeddings. When a student asks a query, high-similarity text chunks are retrieved and injected into the LLM prompt for hallucination-free, syllabus-aligned assistance.")}
          className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold shadow-sm shrink-0"
        >
          💡 How RAG Works
        </Button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Ask CareerOS AI"
            subtitle="Real-time answers grounded in your course material"
            action={
              <div className="flex items-center gap-2">
                <Badge variant="success">RAG Active</Badge>
                <Button variant="ghost" size="sm" onClick={handleClearChat}>
                  🗑️ Clear
                </Button>
              </div>
            }
            bodyClassName="p-4 md:p-6"
          >
            {/* Context filter chips */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[#edf0f5]">
              <span className="text-xs font-semibold text-[#68738a]">Filter Context:</span>
              {['All Resources', 'OS', 'DSA', 'DBMS', 'Exam Papers'].map((ctx) => (
                <button
                  key={ctx}
                  onClick={() => setSelectedContext(ctx)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedContext === ctx
                      ? 'bg-[#315bdc] text-white'
                      : 'bg-[#f8f9fc] text-[#68738a] hover:bg-[#edf2ff] hover:text-[#315bdc]'
                  }`}
                >
                  {ctx}
                </button>
              ))}
            </div>

            {/* Chat Message Window */}
            <div className="h-[380px] overflow-y-auto bg-[#f7f9fd] border border-[#e5e9f1] rounded-2xl p-4 space-y-3.5 scroll-smooth">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.sender === 'me'
                        ? 'bg-[#315bdc] text-white rounded-br-none'
                        : 'bg-white text-[#172033] border border-[#e2e8f0] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-[#94a3b8] mt-1 px-1">
                    {msg.sender === 'me' ? 'You' : 'CareerOS AI'} • {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#68738a] p-2 bg-white rounded-xl border border-[#e2e8f0] w-fit">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#315bdc] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#315bdc] rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-[#315bdc] rounded-full animate-bounce delay-200"></span>
                  </div>
                  <span>Searching university knowledge base...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-[#68738a] mb-2">💡 Suggested Questions:</div>
              <div className="flex flex-wrap gap-2">
                {initialMentorData.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(q)}
                    className="text-xs text-left px-3 py-1.5 bg-[#edf2ff] hover:bg-[#dbe6ff] text-[#315bdc] font-medium rounded-xl border border-[#d6e2ff] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about Operating Systems, DSA, Viva questions, or ML..."
                className="flex-1 px-4 py-3 bg-white border border-[#d9deea] rounded-xl text-sm focus:outline-none focus:border-[#315bdc] focus:ring-1 focus:ring-[#315bdc]"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputQuery.trim() || isTyping}
                className="px-6 font-bold"
              >
                Send →
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Indexed Institution Resources */}
        <div className="space-y-6">
          <Card
            title="Institution Resources"
            subtitle="Indexed for your current Semester"
            action={<Badge variant="info">Synced</Badge>}
          >
            <div className="space-y-3">
              {initialMentorData.resources.map((res) => (
                <div
                  key={res.id}
                  onClick={() => openModal(res.title, `Resource details:\n• Category: ${res.category}\n• Modules: ${res.count}\n• Indexed Key Topics:\n${res.topics?.map(t => '  - ' + t).join('\n')}`)}
                  className="p-3 bg-[#f8f9fc] hover:bg-[#edf2ff] border border-[#e5e9f1] hover:border-[#315bdc]/40 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{res.icon}</span>
                      <div>
                        <b className="text-xs text-[#172033] group-hover:text-[#315bdc] block">
                          {res.title}
                        </b>
                        <span className="text-[11px] text-[#68738a]">{res.count}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#9eb0d7] group-hover:text-[#315bdc]">➔</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Mentor Study Tips">
            <ul className="text-xs text-[#475569] space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>Use the mentor before laboratory vivas to rehearse classical OS and DBMS question sets.</li>
              <li>Ask for code explanations in Python or C++ to improve algorithmic clarity.</li>
              <li>Practice turning theoretical topics into tangible project ideas for your Skill Passport.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorPage;
