
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Protocol {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export const useProtocols = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: protocols, isLoading, error } = useQuery({
    queryKey: ['protocols'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/protocols');
    },
    enabled: !!user,
  });

  const createProtocol = useMutation({
    mutationFn: async (protocol: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/protocols', protocol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  const updateProtocol = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Protocol>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.put(`/protocols/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  const deleteProtocol = useMutation({
    mutationFn: async (protocolId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/protocols/${protocolId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  const updateProtocolOrder = useMutation({
    mutationFn: async (orderUpdates: { id: string; display_order: number }[]) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/protocols/reorder', { orderUpdates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  const attachToExperiment = useMutation({
    mutationFn: async ({ experimentId, protocolId, notes }: { experimentId: string; protocolId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/experiments/${experimentId}/protocols`, { protocolId, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
      queryClient.invalidateQueries({ queryKey: ['experimentProtocols'] });
    },
  });

  const attachToNote = useMutation({
    mutationFn: async ({ noteId, protocolId, notes }: { noteId: string; protocolId: string; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/notes/${noteId}/protocols`, { protocolId, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
      queryClient.invalidateQueries({ queryKey: ['noteProtocols'] });
    },
  });

  const detachFromExperiment = useMutation({
    mutationFn: async ({ experimentId, protocolId }: { experimentId: string; protocolId: string }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/experiments/${experimentId}/protocols/${protocolId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
      queryClient.invalidateQueries({ queryKey: ['experimentProtocols'] });
    },
  });

  return {
    protocols: protocols || [],
    isLoading,
    error,
    createProtocol,
    updateProtocol,
    deleteProtocol,
    updateProtocolOrder,
    attachToExperiment,
    attachToNote,
    detachFromExperiment,
  };
};

export const useExperimentProtocols = (experimentId: string) => {
  const { user } = useAuth();

  const { data: protocols, isLoading, error } = useQuery({
    queryKey: ['experimentProtocols', experimentId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get(`/experiments/${experimentId}/protocols`);
    },
    enabled: !!user && !!experimentId,
  });

  return {
    protocols: protocols || [],
    isLoading,
    error,
  };
};
