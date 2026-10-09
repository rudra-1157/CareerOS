import React, { useState, useRef, useEffect, useCallback } from 'react';
import { mentorService } from '../services/api';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim() || 'text';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={key++} className="my-2 rounded-xl overflow-hidden border border-[#2d3748] text-xs">
          <div className="flex items-center bg-[#1e2535] px-3 py-1.5">
            <span className="text-[#64748b] font-mono text-[10px] uppercase tracking-wide">{lang}</span>
          </div>
          <pre className="bg-[#0f172a] text-[#e2e8f0] p-3 overflow-x-auto font-mono text-[11px] leading-5">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Headings
    const h3m = line.match(/^### (.+)/);
    const h2m = line.match(/^## (.+)/);
    const h1m = line.match(/^# (.+)/);
    if (h1m) { elements.push(<h3 key={key++} className="text-sm font-extrabold text-[#172033] mt-3 mb-1">{inlineFormat(h1m[1])}</h3>); i++; continue; }
    if (h2m) { elements.push(<h4 key={key++} className="text-[13px] font-bold text-[#315bdc] mt-3 mb-1">{inlineFormat(h2m[1])}</h4>); i++; continue; }
    if (h3m) { elements.push(<h5 key={key++} className="text-xs font-semibold text-[#475569] mt-2 mb-0.5 uppercase tracking-wide">{inlineFormat(h3m[1])}</h5>); i++; continue; }

    // Bullet list
    const bullet = line.match(/^[\s]*[-*•] (.+)/);
    if (bullet) {
      elements.push(
        <div key={key++} className="flex items-start gap-1.5 my-0.5">
          <span className="text-[#315bdc] mt-0.5 shrink-0">•</span>
          <span className="text-xs leading-relaxed">{inlineFormat(bullet[1])}</span>
        </div>
      );
      i++; continue;
    }

    // Numbered list
    const numbered = line.match(/^[\s]*(\d+)\. (.+)/);
    if (numbered) {
      elements.push(
        <div key={key++} className="flex items-start gap-1.5 my-0.5">
          <span className="text-[#315bdc] font-semibold text-[11px] mt-0.5 shrink-0 w-4">{numbered[1]}.</span>
          <span className="text-xs leading-relaxed">{inlineFormat(numbered[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(<hr key={key++} className="border-[#e2e8f0] my-2" />);
      i++; continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1.5" />);
      i++; continue;
    }

    // Paragraph
    elements.push(<p key={key++} className="text-xs leading-relaxed my-0.5">{inlineFormat(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function inlineFormat(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={idx} className="font-semibold text-[#172033]">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={idx} className="bg-[#edf2ff] text-[#315bdc] px-1 py-0.5 rounded font-mono text-[10px]">{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={idx} className="italic text-[#475569]">{part.slice(1, -1)}</em>;
    return part;
  });
}

// ─── MentorPage ───────────────────────────────────────────────────────────────
const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  content: "👋 Hello! I'm your **CareerOS AI Learning Mentor** — powered by Gemini.\n\nI can help you with:\n- **Computer science concepts** (OS, DSA, DBMS, Networks)\n- **Programming & debugging** (Python, C++, Java, JavaScript)\n- **Interview preparation** (DSA, System Design, HR)\n- **Career guidance** (What to learn next, study plans)\n- **Code explanations** (Paste any code and ask me!)\n\nWhat would you like to explore today?",
  timestamp: 'Just now',
  isWelcome: true,
};

const MentorPage = () => {
  const { openModal } = useModal();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [resources, setResources] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    const init = async () => {
      try {
        const [sessionRes, resRes, statusRes] = await Promise.allSettled([
          mentorService.getSessions(),
          mentorService.getResources(),
          mentorService.getAIStatus(),
        ]);
        if (sessionRes.status === 'fulfilled') {
          setSessions(Array.isArray(sessionRes.value) ? sessionRes.value : []);
        }
        if (resRes.status === 'fulfilled' && resRes.value?.resources) {
          setResources(resRes.value.resources);
        }
        if (statusRes.status === 'fulfilled') {
          setAiStatus(statusRes.value);
        }
      } finally {
        setSessionsLoading(false);
      }
    };
    init();
  }, []);

  const loadSession = async (sessionId) => {
    if (sessionId === activeSessionId) return;
    try {
      const data = await mentorService.getSession(sessionId);
      setActiveSessionId(sessionId);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      } else {
        setMessages([{ ...WELCOME_MSG, id: 'empty', content: "This is a fresh conversation. What would you like to discuss?" }]);
      }
    } catch { /* keep current */ }
  };

  const startNewConversation = () => {
    setActiveSessionId(null);
    setMessages([WELCOME_MSG]);
    inputRef.current?.focus();
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await mentorService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) startNewConversation();
    } catch { /* ignore */ }
  };

  const refreshSessions = () => {
    mentorService.getSessions().then(list => {
      if (Array.isArray(list)) setSessions(list);
    }).catch(() => {});
  };

  const handleAsk = async (queryText) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isTyping) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev.filter(m => !m.isWelcome), userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await mentorService.ask(textToSend, activeSessionId);

      if (res.session_id) {
        setActiveSessionId(res.session_id);
        refreshSessions();
      }

      const aiMsg = {
        id: res.ai_message?.id || `a-${Date.now()}`,
        role: 'assistant',
        content: res.ai_message?.content || res.response || "I couldn't generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextUsed: res.context_used,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const detail = err.response?.data?.detail || "Sorry, I encountered an error. Please try again.";
      const errContent = detail === 'AI service is not configured.'
        ? "⚠️ **AI service is not configured.**\n\nPlease set your `GEMINI_API_KEY` in `backend/.env` to enable the AI Mentor."
        : `❌ ${detail}`;
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: errContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  const suggestedQuestions = [
    "Explain Peterson's Solution for Process Synchronization",
    "Give me DBMS viva interview questions",
    "Write a Python solution for Two Sum",
    "Help me prepare for an AI/ML interview",
    "What should I learn next?",
    "Explain the CAP theorem with examples",
  ];

  const defaultResources = [
    { id: 1, icon: '📖', title: 'Operating Systems', count: '5 Units Indexed', category: 'Core CS', topics: ['Processes', 'CPU Scheduling', 'Deadlocks'] },
    { id: 2, icon: '🧮', title: 'Data Structures & Algorithms', count: '8 Modules Indexed', category: 'Core CS', topics: ['Trees & Graphs', 'Sorting', 'DP'] },
    { id: 3, icon: '🗄️', title: 'Database Management Systems', count: '6 Units Indexed', category: 'Databases', topics: ['Normalization', 'SQL', 'ACID'] },
    { id: 4, icon: '🤖', title: 'Machine Learning & AI', count: '7 Units Indexed', category: 'AI/ML', topics: ['Supervised Learning', 'Neural Networks', 'Transformers'] },
  ];

  const displayResources = resources.length > 0 ? resources : defaultResources;
  const activeSessionTitle = sessions.find(s => s.id === activeSessionId)?.title;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff] mb-2">
            <span className={`w-2 h-2 rounded-full ${aiStatus?.configured ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            <span>{aiStatus?.configured ? 'Gemini AI Active' : aiStatus ? 'AI Not Configured' : 'Checking...'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">🤖 AI Learning Mentor</h2>
          <p className="text-sm text-[#dce5ff] mt-1 max-w-lg">
            Powered by Google Gemini — ask anything about CS, programming, interviews, or your career path.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSidebar(p => !p)}
            className="bg-white/10 hover:bg-white/20 text-white border-0 font-semibold text-xs"
          >
            {showSidebar ? '◀ Hide History' : '▶ Chat History'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal("About CareerOS AI Mentor", "CareerOS AI Mentor is powered by Google Gemini. It answers arbitrary questions across all computer science domains, programming topics, and career guidance.\n\nFor personalized advice (e.g. 'What should I learn next?'), the AI uses your verified profile data: skills, projects, coding performance, resume ATS score, and roadmap progress.\n\nAll conversations are stored persistently in your session history.")}
            className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold shadow-sm text-xs"
          >
            💡 How It Works
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className={`grid gap-5 ${showSidebar ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>

        {/* Sidebar */}
        {showSidebar && (
          <div className="lg:col-span-1 space-y-4">
            <Card
              title="Conversations"
              subtitle="Your chat history"
              action={
                <button
                  onClick={startNewConversation}
                  className="flex items-center gap-1 text-xs text-[#315bdc] hover:text-[#2449c7] font-semibold"
                >
                  + New
                </button>
              }
            >
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5">
                {sessionsLoading ? (
                  <div className="text-xs text-[#94a3b8] text-center py-4">Loading...</div>
                ) : sessions.length === 0 ? (
                  <div className="text-xs text-[#94a3b8] text-center py-6 leading-relaxed">
                    No conversations yet.<br />Start chatting to save history!
                  </div>
                ) : (
                  sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className={`group flex items-start justify-between gap-2 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        activeSessionId === session.id
                          ? 'bg-[#edf2ff] border-[#315bdc]/40'
                          : 'bg-[#f8f9fc] border-transparent hover:bg-[#f0f4ff] hover:border-[#d6e2ff]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] font-semibold truncate ${activeSessionId === session.id ? 'text-[#315bdc]' : 'text-[#172033]'}`}>
                          {session.title}
                        </p>
                        {session.preview && (
                          <p className="text-[10px] text-[#94a3b8] truncate mt-0.5">{session.preview}</p>
                        )}
                        <p className="text-[10px] text-[#b0bec5] mt-0.5">{session.message_count} msg{session.message_count !== 1 ? 's' : ''}</p>
                      </div>
                      <button
                        onClick={(e) => deleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#ef4444] hover:text-[#dc2626] text-[11px] shrink-0 mt-0.5 transition-opacity"
                        title="Delete conversation"
                      >
                        🗑
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Study Tips">
              <ul className="text-xs text-[#475569] space-y-2 list-disc pl-4 leading-relaxed">
                <li>Ask for code explanations in Python or C++ to improve algorithmic clarity.</li>
                <li>Use the mentor before vivas to rehearse OS and DBMS question sets.</li>
                <li>Say <span className="font-semibold text-[#315bdc]">"What should I learn next?"</span> for personalized career advice.</li>
              </ul>
            </Card>
          </div>
        )}

        {/* Chat Column */}
        <div className={`${showSidebar ? 'lg:col-span-3' : ''} space-y-4`}>
          <Card
            title={activeSessionTitle || 'New Conversation'}
            subtitle="Ask anything — CS concepts, code, interview prep, or career advice"
            action={
              <div className="flex items-center gap-2">
                <Badge variant={aiStatus?.configured ? 'success' : 'warning'}>
                  {aiStatus?.configured ? '● Gemini Active' : '○ AI Offline'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={startNewConversation}>
                  + New
                </Button>
              </div>
            }
            bodyClassName="p-4 md:p-5"
          >
            {/* Chat Window */}
            <div className="h-[440px] overflow-y-auto bg-[#f7f9fd] border border-[#e5e9f1] rounded-2xl p-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Label */}
                  <div className={`flex items-center gap-1.5 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      msg.role === 'user' ? 'bg-[#315bdc] text-white' : 'bg-gradient-to-br from-[#172654] to-[#315bdc] text-white'
                    }`}>
                      {msg.role === 'user' ? 'Y' : 'AI'}
                    </div>
                    <span className="text-[10px] text-[#94a3b8]">
                      {msg.role === 'user' ? 'You' : 'CareerOS AI'} • {msg.timestamp}
                    </span>
                    {msg.contextUsed && (
                      <span className="text-[9px] bg-[#edf2ff] text-[#315bdc] px-1.5 py-0.5 rounded-full font-medium">
                        🎯 Personalized
                      </span>
                    )}
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#315bdc] text-white rounded-br-none'
                      : `bg-white text-[#172033] border rounded-bl-none ${msg.isError ? 'border-red-200 bg-red-50' : 'border-[#e2e8f0]'}`
                  }`}>
                    {msg.role === 'user'
                      ? <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      : renderMarkdown(msg.content)
                    }
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#172654] to-[#315bdc] flex items-center justify-center text-[9px] font-bold text-white shrink-0">AI</div>
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-[#315bdc] rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-[#315bdc] rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-[#315bdc] rounded-full animate-bounce [animation-delay:300ms]" />
                      <span className="text-[10px] text-[#68738a] ml-2">Gemini is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested prompts */}
            <div className="mt-3">
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">💡 Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(q)}
                    disabled={isTyping}
                    className="text-[11px] text-left px-2.5 py-1.5 bg-[#edf2ff] hover:bg-[#dbe6ff] disabled:opacity-50 text-[#315bdc] font-medium rounded-xl border border-[#d6e2ff] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-2">
              <textarea
                ref={inputRef}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
                className="flex-1 px-4 py-3 bg-white border border-[#d9deea] rounded-xl text-xs md:text-sm resize-none focus:outline-none focus:border-[#315bdc] focus:ring-2 focus:ring-[#315bdc]/10 transition-all"
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={!inputQuery.trim() || isTyping}
                onClick={() => handleAsk()}
                className="px-5 font-bold text-xs self-end"
              >
                {isTyping ? '...' : 'Send →'}
              </Button>
            </div>
            {aiStatus && !aiStatus.configured && (
              <p className="text-[11px] text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ <strong>AI service is not configured.</strong> Add <code className="bg-amber-100 px-1 rounded font-mono">GEMINI_API_KEY</code> to <code className="bg-amber-100 px-1 rounded font-mono">backend/.env</code> to enable live AI responses.
              </p>
            )}
          </Card>

          {/* Resources */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {displayResources.map((res) => (
              <div
                key={res.id}
                onClick={() => openModal(res.title, `Resource: ${res.title}\nCategory: ${res.category}\nIndexed: ${res.count}\n\nKey Topics:\n${(res.topics || []).map(t => '  • ' + t).join('\n')}`)}
                className="p-3 bg-white hover:bg-[#edf2ff] border border-[#e5e9f1] hover:border-[#315bdc]/40 rounded-xl transition-all cursor-pointer group"
              >
                <div className="text-xl mb-1">{res.icon}</div>
                <p className="text-[11px] font-semibold text-[#172033] group-hover:text-[#315bdc] leading-snug">{res.title}</p>
                <p className="text-[10px] text-[#94a3b8] mt-0.5">{res.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorPage;

