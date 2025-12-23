
import React, { useState } from 'react';
import { AuthMode } from '../types';
import { storageService } from '../services/storageService';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await storageService.signUp(formData.email, formData.password, formData.name);
        setSuccess('Account created! Please check your email to verify your account before logging in.');
        setMode('login');
      } else {
        await storageService.signIn(formData.email, formData.password);
        // App.tsx handles the redirect via auth state change listener
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 md:py-24 max-w-5xl mx-auto animate-in fade-in duration-1000">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold tracking-wide uppercase">
          Your Mindful Companion
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
          Write your story, <br/>
          <span className="text-indigo-600 italic">one day at a time.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          ZenJournal helps you capture fleeting moments and gain deep insights through the power of mindful writing and AI reflection.
        </p>
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="flex mb-10 bg-slate-50 p-1.5 rounded-2xl">
          <button
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${mode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <Input
                label="Full Name"
                type="text"
                placeholder="How should we address you?"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-xs text-rose-600 font-medium text-center">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-xs text-emerald-600 font-medium text-center">{success}</p>
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-lg rounded-xl mt-4" isLoading={isLoading}>
            {mode === 'login' ? 'Sign In' : 'Create My Journal'}
          </Button>
        </form>
      </div>
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
        {[
          { title: "Cloud Synced", desc: "Your memories are safe and accessible from any device, anywhere.", color: "bg-indigo-50", icon: "☁️" },
          { title: "AI Reflections", desc: "Gain unique perspectives on your thoughts with mindful AI insights.", color: "bg-teal-50", icon: "✨" },
          { title: "Total Privacy", desc: "Your entries are your own. We prioritize security and encryption.", color: "bg-amber-50", icon: "🔒" }
        ].map((feat, i) => (
          <div key={i} className={`p-8 ${feat.color} rounded-3xl border border-white transition-transform hover:-translate-y-1 duration-300`}>
            <div className="text-3xl mb-4">{feat.icon}</div>
            <h3 className="font-bold text-slate-900 mb-2 text-lg">{feat.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
