
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Protocol {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  version: number;
  is_template: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExperimentProtocol {
  id: string;
  experiment_id: string;
  protocol_id: string;
  user_id: string;
  notes: string | null;
  attached_at: string;
  protocol?: Protocol;
}

export interface ExperimentNoteProtocol {
  id: string;
  note_id: string;
  protocol_id: string;
  user_id: string;
  notes: string | null;
  attached_at: string;
  protocol?: Protocol;
}

export const useProtocols = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: protocols, isLoading, error } = useQuery({
    queryKey: ['protocols'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Protocol[];
    },
    enabled: !!user,
  });

  const createProtocol = useMutation({
    mutationFn: async (protocol: Omit<Protocol, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
      if (!user) throw new Error('User not authenticated');

      // Get the highest display_order for this user
      const { data: maxOrderData } = await supabase
        .from('protocols')
        .select('display_order')
        .eq('user_id', user.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].display_order + 1 : 1;

      const { data, error } = await supabase
        .from('protocols')
        .insert([{ ...protocol, user_id: user.id, display_order: nextOrder }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  const updateProtocol = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Protocol> & { id: string }) => {
      const { data, error } = await supabase
        .from('protocols')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  const updateProtocolOrder = useMutation({
    mutationFn: async (protocols: { id: string; display_order: number }[]) => {
      const updates = protocols.map(protocol => 
        supabase
          .from('protocols')
          .update({ display_order: protocol.display_order })
          .eq('id', protocol.id)
          .eq('user_id', user?.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update protocol order');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  const deleteProtocol = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  // Experiment protocol functions
  const attachToExperiment = useMutation({
    mutationFn: async ({ experimentId, protocolId, notes }: { experimentId: string; protocolId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('experiment_protocols')
        .insert([{ 
          experiment_id: experimentId, 
          protocol_id: protocolId, 
          user_id: user.id,
          notes: notes || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentProtocols'] });
    },
  });

  const detachFromExperiment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('experiment_protocols')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentProtocols'] });
    },
  });

  // Note protocol functions
  const attachToNote = useMutation({
    mutationFn: async ({ noteId, protocolId, notes }: { noteId: string; protocolId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('experiment_note_protocols')
        .insert([{ 
          note_id: noteId, 
          protocol_id: protocolId, 
          user_id: user.id,
          notes: notes || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteProtocols'] });
    },
  });

  const detachFromNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('experiment_note_protocols')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteProtocols'] });
    },
  });

  return {
    protocols: protocols || [],
    isLoading,
    error,
    createProtocol,
    updateProtocol,
    updateProtocolOrder,
    deleteProtocol,
    attachToExperiment,
    detachFromExperiment,
    attachToNote,
    detachFromNote,
  };
};

export const useExperimentProtocols = (experimentId: string) => {
  const { user } = useAuth();

  const { data: experimentProtocols, isLoading, error } = useQuery({
    queryKey: ['experimentProtocols', experimentId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('experiment_protocols')
        .select(`
          *,
          protocol:protocols(*)
        `)
        .eq('experiment_id', experimentId)
        .eq('user_id', user.id)
        .order('attached_at', { ascending: false });

      if (error) throw error;
      return data as ExperimentProtocol[];
    },
    enabled: !!user && !!experimentId,
  });

  return {
    experimentProtocols: experimentProtocols || [],
    isLoading,
    error,
  };
};

export const useNoteProtocols = (noteId: string) => {
  const { user } = useAuth();

  const { data: noteProtocols, isLoading, error } = useQuery({
    queryKey: ['noteProtocols', noteId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('experiment_note_protocols')
        .select(`
          *,
          protocol:protocols(*)
        `)
        .eq('note_id', noteId)
        .eq('user_id', user.id)
        .order('attached_at', { ascending: false });

      if (error) throw error;
      return data as ExperimentNoteProtocol[];
    },
    enabled: !!user && !!noteId,
  });

  return {
    noteProtocols: noteProtocols || [],
    isLoading,
    error,
  };
};
