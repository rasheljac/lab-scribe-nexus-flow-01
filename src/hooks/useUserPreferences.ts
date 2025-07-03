
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
    systemConfig?: {
      siteName: string;
      description: string;
      maintenanceMode: boolean;
      allowRegistration: boolean;
      maxUploadSize: string;
      sessionTimeout: string;
      backupFrequency: string;
    };
    smtpConfig?: {
      host: string;
      port: string;
      username: string;
      password: string;
      from_email: string;
      use_tls: boolean;
      enabled: boolean;
    };
    s3Config?: {
      access_key_id: string;
      secret_access_key: string;
      bucket_name: string;
      region: string;
      endpoint: string;
      enabled: boolean;
    };
    emailTemplate?: string;
  };
  hidden_pages: string[];
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
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
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const updatePreferences = async (updates: Partial<Pick<UserPreferences, 'preferences' | 'hidden_pages'>>) => {
    if (!user || !preferences) throw new Error('User not authenticated');
    
    const updatedPreferences = {
      ...preferences,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    setPreferences(updatedPreferences);
  };

  const refetch = async () => {
    await fetchPreferences();
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refetch,
  };
};
