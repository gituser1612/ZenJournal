
import React, { useState, useEffect } from 'react';
import { User, JournalEntry, AuthState } from './types.ts';
import { storageService, supabase } from './services/storageService.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { EditorPage } from './pages/EditorPage.tsx';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'new' | 'edit'>('landing');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check initial session
    storageService.getCurrentUser().then(user => {
      if (user) {
        setAuthState({ user, isAuthenticated: true });
        setCurrentPage('dashboard');
      }
      setIsInitializing(false);
    }).catch(err => {
      console.error("Initialization error:", err);
      setIsInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'User',
          createdAt: session.user.created_at
        };
        setAuthState({ user, isAuthenticated: true });
        setCurrentPage('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setAuthState({ user: null, isAuthenticated: false });
        setCurrentPage('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await storageService.signOut();
  };

  const navigateToEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setCurrentPage('edit');
  };

  const navigateToNew = () => {
    setEditingEntry(null);
    setCurrentPage('new');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl animate-bounce flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <p className="mt-4 text-stone-500 font-medium animate-pulse">Entering Zen space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar 
        user={authState.user} 
        onLogout={handleLogout} 
        onNavigate={(page) => {
          if (page === 'new') navigateToNew();
          else if (page === 'dashboard') setCurrentPage('dashboard');
          else if (page === 'landing') setCurrentPage('landing');
        }}
      />
      
      <main className="flex-grow">
        {currentPage === 'landing' && !authState.isAuthenticated && (
          <LandingPage />
        )}

        {authState.isAuthenticated && (
          <>
            {currentPage === 'dashboard' && (
              <Dashboard 
                user={authState.user!} 
                onNewEntry={navigateToNew} 
                onEditEntry={navigateToEdit}
              />
            )}
            
            {(currentPage === 'new' || currentPage === 'edit') && (
              <EditorPage 
                user={authState.user!} 
                entry={editingEntry} 
                onBack={() => setCurrentPage('dashboard')} 
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t py-8 px-4">
        <div className="max-w-5xl mx-auto text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ZenJournal. A mindful space for your thoughts.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
