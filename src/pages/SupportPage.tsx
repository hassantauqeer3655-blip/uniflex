import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  MessageSquare, 
  Mail, 
  ArrowLeft, 
  X, 
  Send, 
  Bot, 
  User as UserIcon,
  Sparkles,
  LucideIcon,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import StaticLayout from '../components/StaticLayout';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize Gemini safely
let ai: any = null;
try {
  if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini:", e);
}

interface SupportCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  variant?: 'purple' | 'magenta' | 'zinc';
}

const SupportCard = ({ icon: Icon, title, description, buttonText, onClick, variant = 'purple' }: SupportCardProps) => {
  const iconColor = variant === 'purple' ? 'text-primary-purple' : variant === 'magenta' ? 'text-primary-magenta' : 'text-zinc-400';
  const buttonClass = variant === 'purple' ? 'bg-primary-purple hover:bg-primary-magenta' : variant === 'magenta' ? 'bg-primary-magenta hover:bg-primary-purple' : 'border border-zinc-700 text-zinc-400 hover:text-white hover:border-white';
  const variantClass = variant === 'purple' ? 'bg-primary-purple/10 border-primary-purple/20 hover:border-primary-purple/50 group-hover:bg-primary-purple' : variant === 'magenta' ? 'bg-primary-magenta/10 border-primary-magenta/20 hover:border-primary-magenta/50 group-hover:bg-primary-magenta' : 'bg-white/5 border-white/10 hover:border-white/30 group-hover:bg-zinc-700';

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="flex flex-col h-full p-8 rounded-[2.5rem] border backdrop-blur-xl bg-white/5 transition-all duration-500 group"
    >
      <div className={cn(
        "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-500",
        variantClass
      )}>
        <Icon className={cn("h-10 w-10 transition-colors duration-500 group-hover:text-white", iconColor)} />
      </div>
      
      <div className="flex-grow flex flex-col items-center text-center space-y-4">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-[240px]">
          {description}
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <button 
          onClick={onClick}
          className={cn(
            "px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95",
            buttonClass,
            variant !== 'zinc' && "text-white shadow-lg shadow-black/20"
          )}
        >
          {buttonText}
        </button>
      </div>
    </motion.div>
  );
};

export default function SupportPage() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hello! I am the UNIFLEX Support Assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const newMessages = [...chatMessages, { role: 'user', text: userMessage }];
    setChatMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      if (!ai) {
        throw new Error("AI assistant is currently offline. Please try again later or open a support ticket.");
      }
      
      // Create message history for context
      const history = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Add the new user message to history
      history.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
        config: {
          systemInstruction: "You are the UNIFLEX Support Assistant, a friendly and helpful AI dedicated to providing legendary support to UNIFLEX users. UNIFLEX is a premium streaming platform offering Pakistani and Western content, movies, TV shows, and live channels. You help with technical issues, account inquiries, billing, content recommendations, and app navigation. Be professional, concise, and cinematic in your tone. If you don't know something, offer to connect them to a human specialist by suggesting they open a ticket.",
        }
      });

      const botResponse = response.text || "I apologize, but I'm having trouble processing that right now. Would you like to open a support ticket instead?";
      
      setChatMessages(prev => [...prev, { 
        role: 'bot', 
        text: botResponse 
      }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setChatMessages(prev => [...prev, { 
        role: 'bot', 
        text: "I encountered a technical glitch while processing your request. Please try again or contact our human specialists if the issue persists." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StaticLayout>
      <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-purple/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-magenta/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-[1200px] mx-auto px-6 py-24 relative z-10">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                <Sparkles className="h-3 w-3 text-primary-purple" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Support Center</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-purple to-primary-magenta">Assist you?</span>
              </h1>
              <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium">
                Our dedicated support teams and AI agents are standing by to ensure your streaming journey is seamless.
              </p>
            </motion.div>
          </div>

          {/* Support Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <SupportCard 
              icon={MessageCircle}
              title="AI Assistant"
              description="Our advanced AI agent is optimized for real-time resolution of technical and account inquiries."
              buttonText="Start Chat"
              onClick={() => setIsChatOpen(true)}
              variant="purple"
            />
            
            <SupportCard 
              icon={MessageSquare}
              title="Support Ticket"
              description="For complex inquiries requiring technical investigation, our support specialists are ready to help."
              buttonText="Open Ticket"
              onClick={() => navigate('/support/ticket')}
              variant="magenta"
            />
            
            <SupportCard 
              icon={Mail}
              title="Email Support"
              description="Prefer the classic route? Send us an email and receive a response within 24 hours."
              buttonText="Send Email"
              onClick={() => window.location.href = 'mailto:hassantauqeer3655@gmail.com'}
              variant="zinc"
            />
          </div>

          {/* Footer Note */}
          <div className="mt-24 text-center">
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.4em]">
              UNIFLEX Support System v4.2.0 • Available 24/7
            </p>
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsChatOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-white/10 z-[70] flex flex-col shadow-2xl"
              >
                {/* Chat Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-purple/20 flex items-center justify-center border border-primary-purple/30">
                      <Bot className="h-6 w-6 text-primary-purple" />
                    </div>
                    <div>
                      <h4 className="text-white font-black uppercase tracking-tight">Support Assistant</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Online</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {chatMessages.map((msg, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-4",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        msg.role === 'user' ? "bg-primary-magenta/20" : "bg-primary-purple/20"
                      )}>
                        {msg.role === 'user' ? <UserIcon className="h-4 w-4 text-primary-magenta" /> : <Bot className="h-4 w-4 text-primary-purple" />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm max-w-[80%] leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-primary-magenta text-white rounded-tr-none" 
                          : "bg-white/5 border border-white/10 text-zinc-300 rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 flex-row"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-purple/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-purple" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 rounded-tl-none min-w-[60px] justify-center">
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-1.5 h-1.5 bg-primary-purple rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-primary-purple rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-primary-purple rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                          />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-purple/60 ml-1 animate-pulse">Assistant is thinking</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5 bg-zinc-900/50">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder={isLoading ? "Assistant is thinking..." : "Type your message..."}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-sm text-white focus:outline-none focus:border-primary-purple/50 transition-all disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-purple text-white rounded-xl hover:bg-primary-magenta transition-colors shadow-lg disabled:opacity-50 disabled:grayscale"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </StaticLayout>
  );
}
