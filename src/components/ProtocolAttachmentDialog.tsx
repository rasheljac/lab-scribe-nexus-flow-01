
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Loader2, Plus, X } from "lucide-react";
import { useProtocols } from "@/hooks/useProtocols";
import { useToast } from "@/hooks/use-toast";

interface ProtocolAttachmentDialogProps {
  experimentId?: string;
  noteId?: string;
  attachedProtocols?: string[];
  onSuccess?: () => void;
}

const ProtocolAttachmentDialog = ({ experimentId, noteId, attachedProtocols = [], onSuccess }: ProtocolAttachmentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState("");
  const [notes, setNotes] = useState("");

  const { toast } = useToast();
  const { protocols, attachToExperiment, attachToNote } = useProtocols();

  const availableProtocols = protocols.filter(protocol => !attachedProtocols.includes(protocol.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProtocolId) {
      toast({
        title: "Error",
        description: "Please select a protocol to attach",
        variant: "destructive",
      });
      return;
    }

    try {
      if (experimentId) {
        await attachToExperiment.mutateAsync({
          experimentId,
          protocolId: selectedProtocolId,
          notes: notes || undefined,
        });
      } else if (noteId) {
        await attachToNote.mutateAsync({
          noteId,
          protocolId: selectedProtocolId,
          notes: notes || undefined,
        });
      }

      toast({
        title: "Success",
        description: "Protocol attached successfully",
      });
      setIsOpen(false);
      setSelectedProtocolId("");
      setNotes("");
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to attach protocol",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedProtocolId("");
      setNotes("");
    }
  };

  const isLoading = attachToExperiment.isPending || attachToNote.isPending;

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Attach Protocol
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Attach Protocol</h2>
              <Button size="sm" variant="ghost" onClick={() => handleOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {availableProtocols.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No protocols available to attach.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create some protocols first or all protocols are already attached.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Protocol *</label>
                  <Select value={selectedProtocolId} onValueChange={setSelectedProtocolId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a protocol to attach" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProtocols.map((protocol) => (
                        <SelectItem key={protocol.id} value={protocol.id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{protocol.title}</div>
                              {protocol.description && (
                                <div className="text-xs text-gray-500">{protocol.description}</div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any specific notes about how this protocol applies..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Attach Protocol
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProtocolAttachmentDialog;
