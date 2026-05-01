import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Phone, MessageSquare, Mail, Shield, Zap, CreditCard, UserPlus, Activity, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import StaticLayout from '../components/StaticLayout';
import { motion, AnimatePresence } from 'motion/react';

const faqCategories = [
  {
    id: 'account',
    title: 'Account Setup',
    icon: UserPlus,
    questions: [
      { q: "How do I create a UNIFLEX account?", a: "To create an account, click the 'Sign In' button on the home page and select 'Sign Up'. You'll need a valid email address and a secure password." },
      { q: "Can I share my account?", a: "UNIFLEX accounts are intended for use within a single household. You can create up to 5 profiles for different family members." },
      { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login screen. We'll send a secure reset link to your registered email address." }
    ]
  },
  {
    id: 'quality',
    title: 'Streaming Quality',
    icon: Zap,
    questions: [
      { q: "What internet speed do I need?", a: "For Standard Definition (SD), we recommend 3 Mbps. For High Definition (HD), 5 Mbps. For Ultra HD (4K), a stable connection of at least 25 Mbps is required." },
      { q: "Does UNIFLEX support HDR?", a: "Yes, UNIFLEX supports HDR10 and Dolby Vision on compatible devices for a truly cinematic experience." },
      { q: "How do I adjust video quality?", a: "Video quality is adjusted automatically based on your connection. You can also manually set it in 'Account Settings' under 'Playback Settings'." }
    ]
  }
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <StaticLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-zinc-950 py-24 px-4 text-center border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-purple/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black mb-8 tracking-tighter uppercase"
          >
            Help Center
          </motion.h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-6 w-6 group-focus-within:text-primary-purple transition-colors" />
            <input 
              type="text" 
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary-purple/50 shadow-2xl text-lg transition-all backdrop-blur-xl"
            />
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-500">System Status: Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-20 px-4">
        {/* FAQ Categories */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {faqCategories.map((cat) => (
              <div key={cat.id} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-primary-purple/30 transition-all group">
                <cat.icon className="h-8 w-8 text-primary-purple mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{cat.title}</h3>
                <p className="text-zinc-500 text-sm">Essential guides for your {cat.title.toLowerCase()}.</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {faqCategories.flatMap(cat => cat.questions).filter(q => q.q.toLowerCase().includes(searchQuery.toLowerCase())).map((faq, index) => (
              <div key={index} className="border border-white/5 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md">
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition text-left"
                >
                  <span className="text-lg font-bold text-zinc-200">{faq.q}</span>
                  {openFaq === faq.q ? <ChevronUp className="text-primary-purple" /> : <ChevronDown className="text-zinc-500" />}
                </button>
                <AnimatePresence>
                  {openFaq === faq.q && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 text-zinc-400 bg-black/20 border-t border-white/5 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="pt-20 border-t border-white/5">
          <h2 className="text-3xl font-black mb-12 text-center tracking-tighter uppercase">Direct Support</h2>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/support')}
              className="px-12 py-4 bg-gradient-to-r from-primary-purple to-primary-magenta text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              Go to Support Center
            </button>
          </div>
        </section>
      </div>
    </StaticLayout>
  );
}
