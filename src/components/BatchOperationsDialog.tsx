import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';

interface BatchOperationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchOperationsDialog({ isOpen, onOpenChange }: BatchOperationsDialogProps) {
  const [batchSize, setBatchSize] = useState<string>('5');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleBatchMint = async () => {
    if (!batchSize || parseInt(batchSize) <= 0 || parseInt(batchSize) > 20) {
      toast({
        title: "Invalid batch size",
        description: "Batch size must be between 1 and 20",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement batch mint logic
      toast({
        title: "Batch mint initiated",
        description: `Minting ${batchSize} heirlooms...`,
      });
    } catch (error) {
      toast({
        title: "Batch mint failed",
        description: "Failed to mint heirlooms",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchTransfer = async () => {
    if (!recipientAddress || !recipientAddress.startsWith('0x')) {
      toast({
        title: "Invalid recipient address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement batch transfer logic
      toast({
        title: "Batch transfer initiated",
        description: `Transferring tokens to ${recipientAddress}...`,
      });
    } catch (error) {
      toast({
        title: "Batch transfer failed",
        description: "Failed to transfer tokens",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Batch Operations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Mint Heirlooms</CardTitle>
              <CardDescription>
                Mint multiple heirlooms at once for efficient creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batchSize">Number of Heirlooms</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="1"
                  max="20"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  placeholder="Enter batch size (1-20)"
                />
              </div>
              <Button
                onClick={handleBatchMint}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Minting...' : 'Batch Mint'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Transfer Tokens</CardTitle>
              <CardDescription>
                Transfer multiple tokens to a single recipient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <Button
                onClick={handleBatchTransfer}
                disabled={isProcessing}
                className="w-full"
                variant="outline"
              >
                {isProcessing ? 'Transferring...' : 'Batch Transfer'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
