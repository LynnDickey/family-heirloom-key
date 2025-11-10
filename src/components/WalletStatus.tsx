import { useAccount } from 'wagmi';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletStatus = () => {
  const { address, isConnected, chain } = useAccount();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-red-600">
          Disconnected
        </Badge>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <Button onClick={openConnectModal} size="sm">
              Connect Wallet
            </Button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className="text-green-600">
        Connected
      </Badge>
      <span className="text-sm font-mono">
        {formatAddress(address!)}
      </span>
      {chain && (
        <Badge variant="secondary" className="text-xs">
          {chain.name}
        </Badge>
      )}
    </div>
  );
};
