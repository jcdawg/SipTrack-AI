import { supabase } from './supabaseClient';
import { MoodEntry } from '../types';

export const moodService = {
  async getMoodEntries(userId: string): Promise<MoodEntry[]> {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching mood entries:', error);
      return [];
    }

    return (data || []).map(entry => ({
      id: entry.id,
      date: entry.date,
      mood: entry.mood,
      notes: entry.notes,
      tags: entry.tags || [],
    }));
  },

  async saveMoodEntry(mood: {
    user_id: string;
    mood: number;
    notes?: string;
    tags?: string[];
    date?: string;
  }): Promise<MoodEntry | null> {
    const today = new Date().toDateString();
    const moodDate = mood.date ? new Date(mood.date) : new Date();

    const { data: existingMood } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', mood.user_id)
      .gte('date', new Date(today).toISOString())
      .lt('date', new Date(new Date(today).getTime() + 86400000).toISOString())
      .maybeSingle();

    if (existingMood) {
      const { data, error } = await supabase
        .from('mood_entries')
        .update({
          mood: mood.mood,
          notes: mood.notes,
          tags: mood.tags || [],
          date: moodDate.toISOString(),
        })
        .eq('id', existingMood.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating mood entry:', error);
        throw new Error(`Failed to update mood: ${error.message}`);
      }

      return data ? {
        id: data.id,
        date: data.date,
        mood: data.mood,
        notes: data.notes,
        tags: data.tags || [],
      } : null;
    }

    const { data, error } = await supabase
      .from('mood_entries')
      .insert([{
        user_id: mood.user_id,
        mood: mood.mood,
        notes: mood.notes,
        tags: mood.tags || [],
        date: moodDate.toISOString(),
      }])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving mood entry:', error);
      throw new Error(`Failed to save mood: ${error.message}`);
    }

    return data ? {
      id: data.id,
      date: data.date,
      mood: data.mood,
      notes: data.notes,
      tags: data.tags || [],
    } : null;
  },

  async deleteMoodEntry(moodId: string): Promise<boolean> {
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', moodId);

    if (error) {
      console.error('Error deleting mood entry:', error);
      return false;
    }

    return true;
  },

  async migrateMoodsFromLocalStorage(userId: string, localMoods: MoodEntry[]): Promise<void> {
    try {
      const { data: existingMoods } = await supabase
        .from('mood_entries')
        .select('date')
        .eq('user_id', userId);

      const existingDates = new Set(
        (existingMoods || []).map(m => new Date(m.date).toDateString())
      );

      const moodsToMigrate = localMoods.filter(mood => {
        const moodDate = new Date(mood.date).toDateString();
        return !existingDates.has(moodDate);
      });

      if (moodsToMigrate.length > 0) {
        const { error } = await supabase
          .from('mood_entries')
          .insert(
            moodsToMigrate.map(mood => ({
              user_id: userId,
              mood: mood.mood,
              notes: mood.notes,
              tags: mood.tags || [],
              date: mood.date,
            }))
          );

        if (error) {
          console.error('Error migrating moods:', error);
          throw error;
        }

        console.log(`Successfully migrated ${moodsToMigrate.length} mood entries`);
      }
    } catch (error) {
      console.error('Failed to migrate moods:', error);
      throw error;
    }
  }
};
