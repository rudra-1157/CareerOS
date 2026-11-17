import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { mentorService } from '../services/api';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text || typeof text !== 'string') return null;
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
        <div key={key++} className="my-2 rounded-lg overflow-hidden border border-slate-700 text-xs">
          <div className="flex items-center bg-slate-800 px-3 py-1 text-slate-400 font-mono text-[10px] uppercase tracking-wide">
            {lang}
          </div>
          <pre className="bg-slate-950 text-slate-200 p-3 overflow-x-auto font-mono text-[11px] leading-5">
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
    if (h1m) { elements.push(<h3 key={key++} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">{inlineFormat(h1m[1])}</h3>); i++; continue; }
    if (h2m) { elements.push(<h4 key={key++} className="text-[13px] font-semibold text-blue-600 dark:text-blue-400 mt-2 mb-1">{inlineFormat(h2m[1])}</h4>); i++; continue; }
    if (h3m) { elements.push(<h5 key={key++} className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 mb-0.5 uppercase tracking-wide">{inlineFormat(h3m[1])}</h5>); i++; continue; }

    // Bullet list
    const bullet = line.match(/^[\s]*[-*•] (.+)/);
    if (bullet) {
      elements.push(
        <div key={key++} className="flex items-start gap-1.5 my-0.5">
          <span className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">•</span>
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
          <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] mt-0.5 shrink-0 w-4">{numbered[1]}.</span>
          <span className="text-xs leading-relaxed">{inlineFormat(numbered[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(<hr key={key++} className="border-slate-200 dark:border-slate-800 my-2" />);
      i++; continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />);
      i++; continue;
    }

    // Paragraph
    elements.push(<p key={key++} className="text-xs leading-relaxed my-0.5">{inlineFormat(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function inlineFormat(text) {
  if (!text || typeof text !== 'string') return text || '';
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={idx} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={idx} className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded font-mono text-[10px]">{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={idx} className="italic text-slate-600 dark:text-slate-400">{part.slice(1, -1)}</em>;
    return part;
  });
}

// ─── MentorPage ───────────────────────────────────────────────────────────────
const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I am your CareerOS AI Learning Mentor, configured with your institutional CS curriculum.\n\nI can help you with:\n- Core Computer Science concepts (OS, DSA, DBMS, Computer Networks)\n- Algorithmic problem debugging and code explanation\n- Semester viva preparation and past question reviews\n- Placement roadmap and target role guidance\n\nWhat topic would you like to explore today?",
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
      const status = err.response?.status;
      const detail = err.response?.data?.detail || "Sorry, I encountered an error. Please try again.";
      let errContent = detail;
      if (status === 401 || detail === 'Could not validate credentials' || detail === 'Not authenticated') {
        errContent = "**Authentication Required**\n\nYour login session has expired or is invalid. Please sign in again with your account or a demo account to chat with AI Mentor.";
      } else if (detail === 'AI service is not configured.' || detail?.includes('AI service is not configured')) {
        errContent = "**AI service is not configured.**\n\nPlease verify that `GROQ_API_KEY` is set in `backend/.env` to enable live LLM responses.";
      }
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
    "Give me common DBMS viva questions for Semester 3",
    "Write an optimal Python solution for Two Sum",
    "Help me prepare for an AI/ML technical interview",
    "What skills should I prioritize for my target role?",
    "Explain the CAP theorem with concrete examples",
  ];

  const defaultResources = [
    { id: 1, title: 'Operating Systems', count: '5 Units Indexed', category: 'Core CS', topics: ['Processes', 'CPU Scheduling', 'Deadlocks'] },
    { id: 2, title: 'Data Structures & Algorithms', count: '8 Modules Indexed', category: 'Core CS', topics: ['Trees & Graphs', 'Sorting', 'DP'] },
    { id: 3, title: 'Database Management Systems', count: '6 Units Indexed', category: 'Databases', topics: ['Normalization', 'SQL', 'ACID'] },
    { id: 4, title: 'Machine Learning & AI', count: '7 Units Indexed', category: 'AI/ML', topics: ['Supervised Learning', 'Neural Networks', 'Transformers'] },
  ];

  const displayResources = resources.length > 0 ? resources : defaultResources;
  const activeSessionTitle = sessions.find(s => s.id === activeSessionId)?.title;

  return (
    <div className="space-y-5">
      
      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 text-xs font-medium text-blue-300 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${aiStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{aiStatus?.configured ? (aiStatus.provider ? `${aiStatus.provider} Active` : 'Groq AI Active') : aiStatus ? 'AI Service Offline' : 'Checking status...'}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            AI Learning Mentor
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
            Institutional syllabus-indexed guidance powered by Groq ({aiStatus?.model || 'openai/gpt-oss-120b'}). Ask questions about core computer science subjects, algorithms, vivas, or placement readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSidebar(p => !p)}
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs"
          >
            {showSidebar ? <ChevronLeft className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
            {showSidebar ? 'Hide History' : 'Chat History'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal(
              "About CareerOS AI Learning Mentor",
              "The AI Learning Mentor is designed to provide grounded academic support for computer science subjects.\n\n• Syllabus Alignment: Answers incorporate institutional curriculum topics (OS, DBMS, DSA, Networks).\n• Personalized Feedback: When you ask career questions ('What should I learn next?'), the model consults your verified profile, skills, and roadmap.\n• Privacy & Security: Inquiries are logged persistently to your student workspace."
            )}
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            How It Works
          </Button>
        </div>
      </div>

      {/* ─── Main Interface Grid ─────────────────────────────────────────── */}
      <div className={`grid gap-5 ${showSidebar ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>

        {/* Sidebar: Conversation Sessions */}
        {showSidebar && (
          <div className="lg:col-span-1 space-y-4">
            <Card
              title="Conversations"
              subtitle="Session history"
              action={
                <Button variant="ghost" size="sm" onClick={startNewConversation}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New
                </Button>
              }
            >
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5">
                {sessionsLoading ? (
                  <div className="text-xs text-slate-400 text-center py-4">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-6 leading-relaxed">
                    No conversations yet.<br />Start chatting to save history.
                  </div>
                ) : (
                  sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className={`group flex items-start justify-between gap-2 p-2.5 rounded-lg cursor-pointer transition-colors border ${
                        activeSessionId === session.id
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${activeSessionId === session.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {session.title}
                        </p>
                        {session.preview && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{session.preview}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">{session.message_count} messages</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => deleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded transition-opacity"
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Study Guidelines">
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Ask for code explanations in Python or C++ to review algorithmic time and space complexity.</li>
                <li>Use the mentor to simulate viva question sets for OS, DBMS, and Networks.</li>
                <li>Ask <strong className="text-blue-600 dark:text-blue-400">"What should I learn next?"</strong> for advice matched to your target role.</li>
              </ul>
            </Card>
          </div>
        )}

        {/* Chat Conversation Column */}
        <div className={`${showSidebar ? 'lg:col-span-3' : ''} space-y-4`}>
          <Card
            title={activeSessionTitle || 'New Conversation'}
            subtitle="Curriculum concepts, algorithmic code explanations and interview prep"
            action={
              <div className="flex items-center gap-2">
                <Badge variant={aiStatus?.configured ? 'success' : 'warning'} size="sm">
                  {aiStatus?.configured ? (aiStatus.provider ? `${aiStatus.provider} Active` : 'Groq Active') : 'Offline'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={startNewConversation}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New
                </Button>
              </div>
            }
            bodyClassName="p-4 md:p-5"
          >
            {/* Chat Window */}
            <div className="h-[440px] overflow-y-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Sender Label */}
                  <div className={`flex items-center gap-1.5 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {msg.role === 'user' ? 'You' : 'CareerOS Mentor'} • {msg.timestamp}
                    </span>
                    {msg.contextUsed && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded font-medium border border-blue-200 dark:border-blue-900">
                        Personalized
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[88%] rounded-xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : `bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border rounded-bl-none ${msg.isError ? 'border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-300' : 'border-slate-200 dark:border-slate-800'}`
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
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:300ms]" />
                      <span className="text-xs text-slate-400 ml-2">Mentor is formulating response...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested prompts */}
            <div className="mt-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                Suggested Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(q)}
                    disabled={isTyping}
                    className="text-xs text-left px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="mt-4 flex gap-2">
              <textarea
                ref={inputRef}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask any question regarding your syllabus or coding challenges (Press Enter to submit)..."
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={!inputQuery.trim() || isTyping}
                onClick={() => handleAsk()}
                className="px-4 font-semibold text-xs self-end"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Send
              </Button>
            </div>

            {aiStatus && !aiStatus.configured && (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-2.5">
                <strong>AI Service Offline:</strong> Add <code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded font-mono">GROQ_API_KEY</code> to <code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded font-mono">backend/.env</code> to activate live AI answers.
              </p>
            )}
          </Card>

          {/* Curriculum Resource Index */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {displayResources.map((res) => (
              <div
                key={res.id}
                onClick={() => openModal(
                  res.title,
                  `• Subject Domain: ${res.title}\n• Category: ${res.category}\n• Index Count: ${res.count}\n\nKey Indexed Topics:\n${(res.topics || []).map(t => '  - ' + t).join('\n')}`
                )}
                className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug">
                  {res.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{res.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorPage;
