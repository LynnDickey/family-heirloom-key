import { getDefaultConfig } from '@rainbow-me/rainbowkit';
<<<<<<< HEAD
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'LegacyFund',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
});
=======
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Family Heirloom Key',
  projectId: 'fhek-project-2025', // Family Heirloom Key project
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});

// FIXED: Complete wallet reconnection logic with error handling (12 lines restored)
export const connectWallet = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connectors = config.connectors;
      if (connectors.length === 0) {
        throw new Error('No wallet connectors available');
      }

      // Try to connect with timeout
      const connectionPromise = connectors[0].connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );

      const result = await Promise.race([connectionPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.warn(`Wallet connection attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed to connect wallet after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};
>>>>>>> ad68c0b3866257f8f4445896451915be16058b72
