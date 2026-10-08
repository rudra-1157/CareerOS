import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Badge';
import { mentorService } from '../../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi Rudra! Ask me about your subjects, exam preparation, viva or career skills.' }
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
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "CareerOS can answer this using the institution's approved resources. In the full version, RAG will retrieve relevant document chunks before the LLM generates the response." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col h-full">
      <h3 className="text-[17px] font-[700] text-[#172033] mb-3">Ask CareerOS</h3>
      
      <div className="h-[310px] overflow-y-auto bg-[#f7f9fd] rounded-[12px] p-[14px] flex flex-col gap-2 chat-scroll">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] p-[11px_14px] rounded-[12px] text-[14px] leading-[1.45] break-words ${
              msg.sender === 'me'
                ? 'bg-[#315bdc] text-white self-end ml-auto'
                : 'bg-white border border-[#e4e8f0] text-[#172033] self-start'
            }`}
          >
            {msg.text}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                📚 <i>RAG Sources: {msg.sources.join(', ')}</i>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white border border-[#e4e8f0] text-[#68738a] max-w-[85%] p-[11px_14px] rounded-[12px] text-[13px] self-start italic animate-pulse">
            Thinking with Institutional RAG...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-[8px] mt-[12px]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Try: Explain RAG in simple terms"
          className="flex-1 p-[12px] border border-[#d9deea] rounded-[9px] text-[14px] outline-none focus:border-[#315bdc] transition-colors"
        />
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? '...' : 'Ask'}
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
