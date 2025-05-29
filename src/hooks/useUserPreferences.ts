
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserPreferences {
  id: string;
  user_id: string;
  hidden_pages: string[];
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<Pick<UserPreferences, 'hidden_pages' | 'preferences'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert([{ 
          user_id: user.id, 
          ...updates 
        }])
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences
  };
};
