import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWriteContract } from 'wagmi';

export const InheritanceRequestDialog = ({ tokenId }: { tokenId: number }) => {
  const [proofOfLife, setProofOfLife] = useState("");

  const { writeContract, isPending } = useWriteContract();

  const handleRequest = () => {
    if (!proofOfLife.trim()) {
      alert("Proof of life is required");
      return;
    }

    // Simplified contract call - in real implementation would need proper FHE handling
    writeContract({
      address: '0x...', // Contract address
      abi: [], // Contract ABI
      functionName: 'requestInheritance',
      args: [tokenId, proofOfLife, '0x'], // Simplified - missing lifeProof
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Request Inheritance</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Inheritance for Heirloom #{tokenId}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proof" className="text-right">
              Proof of Life
            </Label>
            <Input
              id="proof"
              value={proofOfLife}
              onChange={(e) => setProofOfLife(e.target.value)}
              placeholder="Encrypted proof of life"
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleRequest} disabled={isPending}>
          {isPending ? "Requesting..." : "Submit Request"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
