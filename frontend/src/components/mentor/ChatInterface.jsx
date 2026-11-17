import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { mentorService } from '../../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! Ask me about your academic curriculum, DSA concepts, system design, or interview preparation.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = inputValue.trim();
    if (!query || isLoading) return;

    // Add user message immediately
    setMessages(prev => [...prev, { sender: 'me', text: query }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await mentorService.ask(query);
      setMessages(prev => [
        ...prev,
        { 
          sender: 'ai', 
          text: response.response,
          sources: response.sources 
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "CareerOS can answer this using the institution's approved curriculum and syllabus resources." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ask CareerOS Mentor</h3>
      </div>
      
      <div className="h-[310px] overflow-y-auto bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 flex flex-col gap-2.5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed break-words ${
              msg.sender === 'me'
                ? 'bg-blue-600 text-white self-end ml-auto'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 self-start shadow-2xs'
            }`}
          >
            {msg.text}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-slate-400" />
                <span>RAG Sources: {msg.sources.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 max-w-[85%] p-3 rounded-xl text-xs self-start italic flex items-center gap-2 shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Consulting institutional curriculum embeddings...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Try: Explain RAG retrieval or two-pointer technique..."
          className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
        />
        <Button type="submit" variant="primary" size="sm" disabled={isLoading} className="shrink-0">
          <Send className="w-3.5 h-3.5 mr-1" />
          Ask
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
