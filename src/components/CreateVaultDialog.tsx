import { useState } from "react";
<<<<<<< HEAD
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
=======
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { sanitizeString, isValidEthereumAddress, isValidDeadline, isValidEthAmount, rateLimiter } from '@/lib/security';

export const CreateVaultDialog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [heirAddress, setHeirAddress] = useState("");
  const [deadline, setDeadline] = useState("");
  const [value, setValue] = useState("");

  const { writeContract, isPending } = useWriteContract();

  const handleCreate = () => {
    // Security: Rate limiting to prevent spam
    if (!rateLimiter.isAllowed('create_heirloom', 3, 60000)) {
      alert("Too many attempts. Please wait before trying again.");
      return;
    }

    // FIXED: Complete form validation with security sanitization

    // Title validation with sanitization
    const sanitizedTitle = sanitizeString(title);
    if (!sanitizedTitle) {
      alert("Title is required");
      return;
    }
    if (sanitizedTitle.length < 1 || sanitizedTitle.length > 100) {
      alert("Title must be 1-100 characters");
      return;
    }

    // Description validation with sanitization
    const sanitizedDescription = sanitizeString(description);
    if (!sanitizedDescription) {
      alert("Description is required");
      return;
    }
    if (sanitizedDescription.length < 1 || sanitizedDescription.length > 500) {
      alert("Description must be 1-500 characters");
      return;
    }

    // Heir address validation with security checks
    if (!heirAddress.trim()) {
      alert("Heir address is required");
      return;
    }
    if (!isValidEthereumAddress(heirAddress)) {
      alert("Invalid Ethereum address format");
      return;
    }

    // Deadline validation with security checks
    if (!deadline) {
      alert("Inheritance deadline is required");
      return;
    }
    const deadlineDate = new Date(deadline);
    if (!isValidDeadline(deadlineDate)) {
      alert("Inheritance deadline must be between 1-100 years from now");
      return;
    }

    // Value validation with security checks
    if (!isValidEthAmount(value)) {
      alert("Value must be a valid amount between 0-10000 ETH");
      return;
    }

    // Convert deadline to timestamp
    const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);

    try {
      writeContract({
        address: '0x...', // Contract address
        abi: [], // Contract ABI
        functionName: 'mintHeirloom',
        args: [sanitizedTitle, sanitizedDescription, parseEther(value), heirAddress, deadlineTimestamp],
      });
    } catch (error) {
      console.error('Transaction error:', error);
      alert(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Family Heirloom</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Heirloom</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="heir" className="text-right">
              Heir Address
            </Label>
            <Input
              id="heir"
              value={heirAddress}
              onChange={(e) => setHeirAddress(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value (ETH)
            </Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isPending}>
          {isPending ? "Creating..." : "Create Heirloom"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
>>>>>>> ad68c0b3866257f8f4445896451915be16058b72
