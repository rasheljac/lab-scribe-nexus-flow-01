
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Label {
  id: string;
  user_id: string;
  title: string;
  subtitle: string;
  date: string;
  researcher: string;
  notes: string;
  barcode_data: string;
  quantity: number;
  template_name: string;
  created_at: string;
  updated_at: string;
}

export const useLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLabels = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast({
        title: "Error",
        description: "Failed to fetch labels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addLabel = async (label: Omit<Label, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('labels')
        .insert([{ ...label, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setLabels(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding label:', error);
      toast({
        title: "Error",
        description: "Failed to add label",
        variant: "destructive",
      });
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLabels(prev => prev.filter(label => label.id !== id));
      toast({
        title: "Success",
        description: "Label deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: "Error",
        description: "Failed to delete label",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [user]);

  return {
    labels,
    loading,
    addLabel,
    deleteLabel,
    refetch: fetchLabels
  };
};
