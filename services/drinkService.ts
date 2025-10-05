import { supabase } from './supabaseClient';
import { SavedDrink, DrinkLog } from '../types';

export const drinkService = {
  async getSavedDrinks(userId: string): Promise<SavedDrink[]> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('user_id', userId)
      .order('last_used_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved drinks:', error);
      return [];
    }

    return data || [];
  },

  async saveDrink(drink: Omit<SavedDrink, 'id' | 'created_at' | 'last_used_at'>): Promise<SavedDrink | null> {
    console.log('Attempting to save drink:', drink);

    const existingDrink = await this.findExistingDrink(drink.user_id, drink.name, drink.type);

    if (existingDrink) {
      console.log('Found existing drink, updating last_used_at:', existingDrink.id);
      const { data, error } = await supabase
        .from('drinks')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', existingDrink.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating drink:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to update drink: ${error.message}`);
      }

      console.log('Successfully updated drink:', data);
      return data;
    }

    console.log('Creating new drink...');
    const { data, error } = await supabase
      .from('drinks')
      .insert([drink])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving drink:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to save drink: ${error.message}`);
    }

    console.log('Successfully created drink:', data);
    return data;
  },

  async findExistingDrink(userId: string, name: string, type: string): Promise<SavedDrink | null> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('user_id', userId)
      .eq('name', name)
      .eq('type', type)
      .maybeSingle();

    if (error) {
      console.error('Error finding drink:', error);
      return null;
    }

    return data;
  },

  async logDrink(log: {
    user_id: string;
    drink_id?: string;
    name: string;
    type: string;
    volume_ml: number;
    alcohol_percentage: number;
    calories: number;
    cost: number;
    mood_before?: string;
    mood_after?: string;
    notes?: string;
    logged_at?: string;
  }): Promise<boolean> {
    console.log('Attempting to log drink:', log);

    const { data, error } = await supabase
      .from('drink_logs')
      .insert([{
        ...log,
        logged_at: log.logged_at || new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error logging drink:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to log drink: ${error.message}`);
    }

    console.log('Successfully logged drink:', data);
    return true;
  },

  async getDrinkLogs(userId: string, limit?: number): Promise<any[]> {
    let query = supabase
      .from('drink_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching drink logs:', error);
      return [];
    }

    return data || [];
  },

  async deleteDrinkLog(logId: string): Promise<boolean> {
    const { error } = await supabase
      .from('drink_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error('Error deleting drink log:', error);
      return false;
    }

    return true;
  }
};
