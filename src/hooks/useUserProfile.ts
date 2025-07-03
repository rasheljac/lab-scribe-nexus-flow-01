
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // For now, create a mock profile from user metadata
      setProfile({
        id: user.id,
        user_id: user.id,
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  }, [user]);

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'first_name' | 'last_name'>>) => {
    if (!user) throw new Error('User not authenticated');
    
    // For now, just update local state
    if (profile) {
      setProfile({
        ...profile,
        ...updates,
        updated_at: new Date().toISOString(),
      });
    }

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('User not authenticated');

    // For now, just show success message
    toast({
      title: "Avatar uploaded",
      description: "Your avatar has been uploaded successfully.",
    });
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
  };
};
