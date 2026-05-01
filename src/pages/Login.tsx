import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await signUp(email, password);
        alert('Check your email for the confirmation link!');
      } else {
        await signIn(email, password);
      }
      navigate('/browse');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="relative h-screen w-screen flex flex-col bg-bg-dark md:items-center md:justify-center md:bg-transparent">
      <div className="absolute inset-0 -z-10 hidden md:block">
        <img 
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-07583f8b564e/547d3049-38c5-4091-9398-d358364528fe/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg" 
          className="h-full w-full object-cover opacity-40"
          alt="background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/60 to-bg-dark/80" />
      </div>

      <BackButton />

      <div className="absolute left-20 top-4 md:left-32 md:top-6">
        <Logo />
      </div>

      <form 
        onSubmit={handleSubmit}
        className="relative mt-24 space-y-8 rounded-xl bg-card-dark/90 py-10 px-6 md:mt-0 md:max-w-md md:px-14 border border-white/5 backdrop-blur-xl shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white">{isRegister ? 'Sign Up' : 'Sign In'}</h1>
        
        {error && <p className="text-sm text-primary-magenta bg-primary-magenta/10 p-3 rounded border border-primary-magenta/20">{error}</p>}

        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full rounded-lg bg-white/5 border border-white/10 px-5 py-3 text-white outline-none focus:border-primary-purple/50 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full rounded-lg bg-white/5 border border-white/10 px-5 py-3 text-white outline-none focus:border-primary-purple/50 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="w-full rounded-lg bg-gradient-to-r from-primary-purple to-primary-magenta py-3 font-bold text-white hover:opacity-90 transition shadow-lg shadow-primary-purple/20">
          {isRegister ? 'Sign Up' : 'Sign In'}
        </button>

        <div className="text-gray-400 text-sm">
          {isRegister ? 'Already have an account?' : 'New to UNIFLEX?'}
          <button 
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 text-white font-medium hover:underline"
          >
            {isRegister ? 'Sign in now' : 'Sign up now'}
          </button>
        </div>
      </form>
    </div>
  );
}
