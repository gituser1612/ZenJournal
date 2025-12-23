
import { createClient } from '@supabase/supabase-js';
import { JournalEntry, User } from '../types';

const SUPABASE_URL = 'https://lefrzpvrpbuosbjddpsp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZnJ6cHZycGJ1b3NiamRkcHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTE5OTQsImV4cCI6MjA4MTk4Nzk5NH0.arSF_w0Xd06MRVJKnaHllmciCJ2uSLBqME27BDJRE2w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const storageService = {
  // Auth Operations
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    if (error) throw error;
    return data.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      createdAt: user.created_at
    };
  },

  // Entry Operations
  async getEntries(userId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase fetch error:", error);
      throw error;
    }
    
    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title || '',
      content: item.content || '',
      aiInsight: item.ai_insight || '',
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  async saveEntry(entry: Partial<JournalEntry> & { userId: string }): Promise<JournalEntry> {
    const payload = {
      user_id: entry.userId,
      title: entry.title,
      content: entry.content,
      ai_insight: entry.aiInsight,
      updated_at: new Date().toISOString()
    };

    if (entry.id) {
      const { data, error } = await supabase
        .from('entries')
        .update(payload)
        .eq('id', entry.id)
        .select()
        .single();
      
      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        aiInsight: data.ai_insight,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } else {
      const { data, error } = await supabase
        .from('entries')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        aiInsight: data.ai_insight,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
  },

  async deleteEntry(entryId: string) {
    console.log(`[StorageService] Attempting delete for ID: ${entryId}`);
    
    // Using .select() after delete tells us if the row was actually affected
    const { data, error, status } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)
      .select();
    
    if (error) {
      console.error("[StorageService] Supabase delete error:", error);
      throw error;
    }

    // If RLS is enabled and the user_id doesn't match, Supabase returns success (204) 
    // but data will be empty.
    if (!data || data.length === 0) {
      console.warn("[StorageService] Delete request returned no rows. Check RLS policies.");
      throw new Error("Permission denied or entry not found in database.");
    }

    console.log(`[StorageService] Delete successful. Status: ${status}`);
    return true;
  }
};
