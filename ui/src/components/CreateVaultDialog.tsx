import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface CreateVaultDialogProps {
  children: React.ReactNode;
}

const CreateVaultDialog = ({ children }: CreateVaultDialogProps) => {
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    beneficiary: "",
    unlockDate: "",
    generation: "1",
  });

  const handleCreate = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.amount || !formData.beneficiary || !formData.unlockDate) {
      toast.error("Please fill in all fields");
      return;
    }

    // Here you would integrate with smart contracts
    toast.success("Vault creation initiated! This will be processed on-chain.");
    setOpen(false);
    setFormData({
      amount: "",
      beneficiary: "",
      unlockDate: "",
      generation: "1",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Create Your Vault
          </DialogTitle>
          <DialogDescription>
            Set up encrypted fund allocations with unlock conditions for your beneficiaries.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiary Wallet Address</Label>
            <Input
              id="beneficiary"
              placeholder="0x..."
              value={formData.beneficiary}
              onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unlockDate">Unlock Date</Label>
            <Input
              id="unlockDate"
              type="date"
              value={formData.unlockDate}
              onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="generation">Generation Tier</Label>
            <select
              id="generation"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.generation}
              onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
            >
              <option value="1">Generation 1 (Primary - 100%)</option>
              <option value="2">Generation 2 (Children - 75%)</option>
              <option value="3">Generation 3 (Grandchildren - 50%)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleCreate}
          >
            Create Vault
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVaultDialog;
