import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { AlertCircle, X, ChevronDown, Zap, Globe, Lock, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login3D() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const { signIn, signUp, cooldown } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegister) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/browse');
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "What is UNIFLEX?",
      answer: "UNIFLEX is a cutting-edge movie streaming platform that brings you high-quality content across all genres, powered by a seamless user interface and high-speed streaming technology."
    },
    {
      question: "How do I create an account?",
      answer: "Simply click on 'Create Account' at the top of the login section, enter your email and a secure password, and you're ready to start your journey."
    },
    {
      question: "Can I watch on multiple devices?",
      answer: "Yes! Your Uniflex account supports streaming on multiple devices simultaneously, ensuring you never miss your favorite content whether you're at home or on the go."
    }
  ];

  const features = [
    {
      title: "Fast Streaming",
      description: "Experience zero buffering with our globally distributed content delivery network optimized for high speed.",
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Unlimited Content",
      description: "Access thousands of movies, TV shows, and exclusives with no hidden limits or extra charges.",
      icon: <PlayCircle className="h-6 w-6" />
    },
    {
      title: "User-Friendly UI",
      description: "Navigate with ease through our intuitive interface designed for the best possible viewing experience.",
      icon: <Globe className="h-6 w-6" />
    },
    {
      title: "Secure Access",
      description: "Your data and viewing history are protected with industry-standard encryption and security protocols.",
      icon: <Lock className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-[#f8fbff] overflow-x-hidden selection:bg-primary-purple selection:text-white">
      {/* Cloudy Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#e0f0ff] blur-[120px] rounded-full opacity-60" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f0eaff] blur-[100px] rounded-full opacity-50" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-[#fff0f5] blur-[110px] rounded-full opacity-40" 
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      </div>

      {/* Navigation / Logo */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 transition-all">
        <Logo variant="dark" />
      </nav>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-red-50 backdrop-blur-xl border border-red-200 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-red-900 font-bold text-sm">Warning</p>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="h-8 w-8 rounded-full hover:bg-red-200/50 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Card Section */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-white/50 p-10 md:p-14 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PlayCircle className="h-24 w-24 text-primary-purple" />
            </div>

            <div className="relative space-y-10">
              <div className="space-y-6 text-center">
                <div className="space-y-3">
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">New to App?</p>
                  <button 
                    onClick={() => setIsRegister(true)}
                    className={cn(
                      "px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] transition-all",
                      isRegister ? "bg-primary-purple text-white shadow-lg shadow-primary-purple/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    Create Account
                  </button>
                </div>

                <div className="h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Already have Account.</p>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                    Login
                  </h1>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="group relative">
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 outline-none transition-all focus:border-primary-purple focus:ring-4 focus:ring-primary-purple/5"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="group relative">
                    <input 
                      type="password" 
                      placeholder="Password"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 outline-none transition-all focus:border-primary-purple focus:ring-4 focus:ring-primary-purple/5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  disabled={loading || cooldown > 0}
                  className="w-full h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black uppercase tracking-[0.3em] transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl"
                >
                  {loading ? (
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{cooldown > 0 ? `Locked (${cooldown}s)` : (isRegister ? 'Register' : 'Login')}</span>
                  )}
                </button>

                {isRegister && (
                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setIsRegister(false)}
                      className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary-purple transition-colors"
                    >
                      Wait, I have an account
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center space-y-4 mb-20" id="more-reasons">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase">
            More Reasons <span className="text-primary-purple">to Watch</span>
          </h2>
          <div className="h-2 w-20 bg-primary-purple mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-primary-purple/30 hover:shadow-2xl transition-all duration-500"
            >
              <div className="h-16 w-16 bg-primary-purple/5 rounded-3xl flex items-center justify-center text-primary-purple mb-8 group-hover:scale-110 group-hover:bg-primary-purple group-hover:text-white transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 md:py-32" id="faq">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase">
            Frequently <span className="text-primary-magenta">Asked</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Got questions? We have answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left"
              >
                <span className="text-lg font-black text-gray-900 uppercase tracking-tight">{faq.question}</span>
                <ChevronDown className={cn("h-6 w-6 text-gray-400 transition-transform duration-300", activeFaq === index && "rotate-180 text-primary-magenta")} />
              </button>
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-gray-100 bg-white/30 backdrop-blur-md px-6 py-12 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo iconOnly className="opacity-50" />
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.5em]">
            UNIFLEX | © 2026
          </p>
          <div className="flex gap-8">
            <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Privacy</button>
            <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
