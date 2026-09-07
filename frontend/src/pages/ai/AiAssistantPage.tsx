import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';
import { Card } from '../../components/common/Card';
import type { ChatMessage } from '../../types';
import ReactMarkdown from 'react-markdown';

const SUGGESTED = [
  "What did the team work on last week?",
  "Who has the most open blockers?",
  "Summarize this week's achievements",
  "Which projects had the most tasks completed?",
  "Are there any recurring blockers across the team?",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiService.sendMessage(text, messages);
      setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
    } catch {
      toast.error('Failed to get AI response. Check your API key.');
      setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please ensure the Groq API key is configured.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-100px)] max-h-[850px] max-w-4xl mx-auto animate-[fadeInUp_0.4s_ease]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">AI Assistant</h1>
          <p className="text-text-secondary mt-1 text-sm">Ask questions about your team's activity and reports.</p>
        </div>
      </div>

      <Card padding="none" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-4">
              <div className="w-16 h-16 bg-[#8b5cf6]/ rounded-2xl border border-[#8b5cf6]/ flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <Bot size={32} className="text-accent-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">How can I help you?</h3>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                I'm your AI assistant. Ask me anything about your team's weekly reports, blockers, workload distribution, or general work patterns.
              </p>
              <div className="w-full flex flex-col gap-2.5">
                {SUGGESTED.slice(0, 4).map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1f2937]/ border border-white/[0.04] hover:border-[#8b5cf6]/ hover:bg-white/[0.03] text-left text-sm text-text-secondary hover:text-text-primary transition-all group"
                  >
                    <MessageSquare size={16} className="text-accent-secondary group-hover:text-accent-primary shrink-0 transition-colors" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col w-full max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-accent-secondary text-white' : 'bg-accent-primary text-white'}`}>
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <span className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-accent-secondary to-blue-600 text-white rounded-tr-sm' : 'bg-bg-tertiary border border-white/[0.06] text-text-primary rounded-tl-sm'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_table]:w-full [&_table]:text-xs [&_th]:border [&_th]:border-white/10 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-white/10 [&_td]:p-2 [&_p]:mb-2 [&_p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex flex-col w-full max-w-[85%] mr-auto items-start">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-accent-primary text-white flex items-center justify-center shrink-0"><Bot size={12} /></div>
                    <span className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-wider">AI Assistant</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-bg-tertiary border border-white/[0.06] rounded-tl-sm">
                    <div className="flex gap-1.5 items-center h-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#111827]/ shrink-0">
          <div className="relative flex items-end gap-2 bg-bg-tertiary border border-border-color focus-within:border-accent-primary rounded-xl p-1.5 transition-colors">
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!loading && input.trim()) sendMessage(input); } }}
              placeholder="Message AI Assistant..."
              className="w-full bg-transparent border-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none min-h-[40px] max-h-[120px] p-2.5 custom-scrollbar"
              rows={1} style={{ height: input ? 'auto' : '40px' }} disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
              className={`p-2.5 rounded-lg shrink-0 transition-all ${input.trim() && !loading ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5' : 'bg-white/5 text-text-muted cursor-not-allowed'}`}
            >
              <Send size={16} className={input.trim() && !loading ? 'ml-0.5' : ''} />
            </button>
          </div>
          <p className="text-center text-[0.65rem] text-text-muted mt-2">AI can make mistakes. Verify important info.</p>
        </div>
      </Card>
    </div>
  );
}
