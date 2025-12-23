
import React, { useState, useEffect, useRef } from 'react';
import { User, JournalEntry } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { Button } from '../components/Button';

interface EditorPageProps {
  user: User;
  entry: JournalEntry | null;
  onBack: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ user, entry, onBack }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [aiInsight, setAiInsight] = useState(entry?.aiInsight || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!entry && titleRef.current) {
      titleRef.current.focus();
    }
  }, [entry]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);

    try {
      await storageService.saveEntry({
        id: entry?.id,
        userId: user.id,
        title: title || 'Untitled Entry',
        content,
        aiInsight
      });
      onBack();
    } catch (err) {
      alert("Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIInsight = async () => {
    if (!content.trim() || content.length < 10) {
      alert("Please write a bit more so AI can understand your thoughts.");
      return;
    }

    setIsGeneratingInsight(true);
    const insight = await geminiService.generateInsight(content);
    setAiInsight(insight);
    setIsGeneratingInsight(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={onBack}
            className="text-stone-400 hover:text-stone-700 flex items-center transition-all font-semibold group w-fit"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center mr-3 group-hover:border-stone-400 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to Journal
          </button>
          <div className="flex items-center space-x-3">
             <Button 
                variant="outline" 
                onClick={generateAIInsight} 
                isLoading={isGeneratingInsight} 
                disabled={isSaving}
                className="bg-white border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-stone-300 rounded-xl px-5"
             >
              AI Insight
             </Button>
             <Button 
                variant="primary" 
                onClick={handleSave} 
                isLoading={isSaving} 
                disabled={isGeneratingInsight}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 shadow-lg shadow-indigo-100"
             >
              Save Memory
             </Button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-stone-200/60 p-8 md:p-16 space-y-10 min-h-[75vh]">
          <div className="space-y-4">
            <input
              ref={titleRef}
              type="text"
              placeholder="Title of this chapter..."
              className="w-full text-5xl font-serif font-bold border-none focus:ring-0 outline-none placeholder:text-stone-200 text-stone-800 bg-transparent tracking-tight"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="flex items-center text-xs font-bold text-stone-300 uppercase tracking-widest pb-8 border-b border-stone-100">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(entry?.createdAt || Date.now()).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <textarea
            placeholder="What's unfolding in your world today?"
            className="w-full min-h-[45vh] text-2xl text-stone-600 font-medium leading-relaxed border-none focus:ring-0 outline-none resize-none placeholder:text-stone-100 bg-transparent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {aiInsight && (
            <div className="mt-16 p-10 bg-indigo-50/40 rounded-[2rem] border border-indigo-100/50 animate-in zoom-in-95 fade-in duration-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <h4 className="text-indigo-900 font-bold tracking-[0.2em] uppercase text-[10px]">Zen Reflection</h4>
              </div>
              <p className="text-indigo-800/90 text-xl leading-relaxed font-serif italic selection:bg-indigo-200">"{aiInsight}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
