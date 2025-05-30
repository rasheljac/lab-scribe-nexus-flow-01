
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
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
        throw error;
      }
      
      if (data) {
        const convertedData: UserPreferences = {
          ...data,
          preferences: (typeof data.preferences === 'object' && data.preferences !== null) 
            ? data.preferences as Record<string, any> 
            : {}
        };
        setPreferences(convertedData);
      } else {
        // Create default preferences if none exist
        const defaultPrefs = {
          user_id: user.id,
          hidden_pages: [],
          preferences: {}
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert([defaultPrefs])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating default preferences:', insertError);
          throw insertError;
        }
        
        if (newData) {
          const convertedNewData: UserPreferences = {
            ...newData,
            preferences: (typeof newData.preferences === 'object' && newData.preferences !== null) 
              ? newData.preferences as Record<string, any> 
              : {}
          };
          setPreferences(convertedNewData);
        }
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<Pick<UserPreferences, 'hidden_pages' | 'preferences'>>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // First, check if preferences exist
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('user_preferences')
          .insert([{ 
            user_id: user.id, 
            ...updates 
          }])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }
      
      if (result) {
        const convertedData: UserPreferences = {
          ...result,
          preferences: (typeof result.preferences === 'object' && result.preferences !== null) 
            ? result.preferences as Record<string, any> 
            : {}
        };
        setPreferences(convertedData);
        return convertedData;
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
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
