
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface UserPreferences {
  id: string;
  user_id: string;
  preferences: {
    notifications?: {
      email?: boolean;
      tasks?: boolean;
      system?: boolean;
    };
    theme?: string;
    dashboardTaskOrder?: string[];
  };
  hidden_pages: string[];
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Create default preferences
      setPreferences({
        id: user.id,
        user_id: user.id,
        preferences: {
          notifications: {
            email: true,
            tasks: true,
            system: false,
          },
          theme: 'system',
          dashboardTaskOrder: [],
        },
        hidden_pages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  }, [user]);

  const updatePreferences = async (updates: Partial<Pick<UserPreferences, 'preferences' | 'hidden_pages'>>) => {
    if (!user || !preferences) throw new Error('User not authenticated');
    
    setPreferences({
      ...preferences,
      ...updates,
      updated_at: new Date().toISOString(),
    });
  };

  return {
    preferences,
    loading,
    updatePreferences,
  };
};
