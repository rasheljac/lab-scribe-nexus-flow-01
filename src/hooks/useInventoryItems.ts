
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  supplier: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  location: string;
  expiry_date: string;
  status: string;
  last_ordered: string;
  cost: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export const useInventoryItems = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items, isLoading: loading, error } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/inventory-items');
    },
    enabled: !!user,
  });

  const addItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const data = await apiClient.post('/inventory-items', item);
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      return data;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const data = await apiClient.put(`/inventory-items/${id}`, updates);
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      return data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiClient.delete(`/inventory-items/${id}`);
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    }
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
  };

  return {
    items: items || [],
    loading,
    addItem,
    updateItem,
    deleteItem,
    refetch
  };
};
