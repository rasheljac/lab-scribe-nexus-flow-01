
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Package, DollarSign, Building, Hash, ShoppingCart, Edit } from "lucide-react";
import { InventoryItem } from "@/hooks/useInventoryItems";

interface InventoryItemDetailsDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onOrder: (item: InventoryItem) => void;
}

const InventoryItemDetailsDialog = ({ 
  item, 
  open, 
  onOpenChange, 
  onEdit, 
  onOrder 
}: InventoryItemDetailsDialogProps) => {
  if (!item) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Category */}
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(item.status)}>
              {item.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">{item.category}</Badge>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Hash className="h-4 w-4" />
                Current Stock
              </div>
              <p className="text-2xl font-bold">{item.current_stock} {item.unit}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Package className="h-4 w-4" />
                Min Stock
              </div>
              <p className="text-lg">{item.min_stock} {item.unit}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Package className="h-4 w-4" />
                Max Stock
              </div>
              <p className="text-lg">{item.max_stock} {item.unit}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Building className="h-4 w-4" />
                Supplier
              </div>
              <p>{item.supplier}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <p>{item.location || 'Not specified'}</p>
            </div>

            {item.cost && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  Cost
                </div>
                <p className="text-green-600 font-medium">{item.cost}</p>
              </div>
            )}

            {item.expiry_date && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Expiry Date
                </div>
                <p>{new Date(item.expiry_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onEdit(item)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Item
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOrder(item)}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {item.url ? 'Order Online' : 'Order Item'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemDetailsDialog;
