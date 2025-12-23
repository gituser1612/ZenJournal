
import React, { useState, useEffect } from 'react';
import { User, JournalEntry } from '../types';
import { storageService } from '../services/storageService';
import { Button } from '../components/Button';

interface DashboardProps {
  user: User;
  onNewEntry: () => void;
  onEditEntry: (entry: JournalEntry) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNewEntry, onEditEntry }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [user.id]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const data = await storageService.getEntries(user.id);
      setEntries(data);
    } catch (err) {
      console.error("Failed to load entries", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    // Stop all propagation to prevent navigating to the editor
    e.stopPropagation();
    e.preventDefault();

    if (window.confirm('Are you sure you want to delete this memory?')) {
      try {
        setDeletingId(id);
        console.log(`[Dashboard] Initiating delete for entry: ${id}`);
        
        await storageService.deleteEntry(id);
        
        // Only update local state if the service call succeeded
        setEntries(prevEntries => prevEntries.filter(e => e.id !== id));
        console.log(`[Dashboard] Successfully removed ${id} from state`);
      } catch (err: any) {
        console.error("[Dashboard] Delete error caught:", err);
        alert(`Could not delete: ${err.message || 'Unknown error'}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">My Journey</h2>
          <p className="text-slate-500 font-medium">
            {entries.length === 0 ? "Start your first chapter today" : `${entries.length} memories captured`}
          </p>
        </div>
        {entries.length > 0 && (
          <Button onClick={onNewEntry} className="rounded-full px-6 shadow-md">
            <span className="mr-2 text-xl">+</span> New Entry
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Revisiting your memories...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center shadow-sm">
          <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 transform rotate-3">
            <span className="text-5xl">📖</span>
          </div>
          <h3 className="text-3xl font-serif font-bold text-slate-800 mb-4">Every story has a beginning.</h3>
          <p className="text-slate-500 max-w-sm mb-12 text-lg leading-relaxed">
            Your personal space for reflection is ready. What would you like to remember about today?
          </p>
          <div className="flex justify-center w-full">
            <Button 
              variant="metallic" 
              onClick={onNewEntry}
              className="px-12 py-5 text-xl rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Write Today's Story
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {entries.map((entry) => (
            <div 
              key={entry.id}
              onClick={() => deletingId !== entry.id && onEditEntry(entry)}
              className={`group bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden ${deletingId === entry.id ? 'opacity-50 grayscale scale-95' : ''}`}
            >
              {deletingId === entry.id && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-6">
                <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(entry.createdAt).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <button 
                  onClick={(e) => handleDelete(entry.id, e)}
                  disabled={deletingId === entry.id}
                  className="relative z-30 md:opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all p-2 -mr-2 rounded-full"
                  title="Delete Entry"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {entry.title || "Untitled Entry"}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-4 leading-relaxed flex-grow">
                {entry.content}
              </p>
              
              {entry.aiInsight && (
                <div className="mt-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></div>
                    Insight
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 italic leading-relaxed">
                    "{entry.aiInsight}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
