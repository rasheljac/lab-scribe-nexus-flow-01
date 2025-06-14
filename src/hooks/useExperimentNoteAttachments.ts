
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ExperimentNoteAttachment {
  id: string;
  note_id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

interface S3Config {
  endpoint: string;
  bucket_name: string;
  access_key_id: string;
  secret_access_key: string;
  region: string;
  enabled: boolean;
}

interface UserPreferences {
  s3Config?: S3Config;
  [key: string]: any;
}

export const useExperimentNoteAttachments = (noteId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attachments, isLoading, error } = useQuery({
    queryKey: ['experimentNoteAttachments', noteId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('experiment_note_attachments')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExperimentNoteAttachment[];
    },
    enabled: !!user && !!noteId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file, noteId }: { file: File; noteId: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Starting file upload:', file.name, file.size);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('noteId', noteId);

      const { data, error } = await supabase.functions.invoke('s3-file-operations', {
        body: formData,
      });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message || 'Upload failed');
      }

      console.log('Upload successful:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ExperimentNoteAttachment) => {
      console.log('Deleting attachment:', attachment.id);

      const { data, error } = await supabase.functions.invoke('s3-file-operations', {
        body: { attachmentId: attachment.id },
      });

      if (error) {
        console.error('Delete error:', error);
        throw new Error(error.message || 'Delete failed');
      }

      console.log('Delete successful:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const downloadAttachment = async (attachment: ExperimentNoteAttachment) => {
    try {
      console.log('Starting download for:', attachment.filename);

      // Get user preferences to construct the download URL
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user?.id)
        .single();

      if (prefsError) {
        console.error('Error fetching user preferences:', prefsError);
        throw new Error('Failed to fetch user preferences');
      }

      // Safely access the preferences
      const preferences = userPrefs?.preferences as UserPreferences;
      if (!preferences?.s3Config) {
        throw new Error('S3 configuration not found in user preferences');
      }

      const s3Config = preferences.s3Config;
      if (!s3Config.enabled) {
        throw new Error('S3 configuration is disabled');
      }
      
      // Generate direct S3 URL for download
      const downloadUrl = `${s3Config.endpoint}/${s3Config.bucket_name}/${attachment.file_path}`;
      
      console.log('Download URL:', downloadUrl);
      
      // Create download link
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = attachment.filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  return {
    attachments: attachments || [],
    isLoading,
    error,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
  };
};
