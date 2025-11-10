import { useMemo } from 'react';
import { useReadContract } from 'wagmi';

// Optimized hook for heirloom data fetching with caching
export const useHeirlooms = (contractAddress: string, userAddress?: string) => {
  // Memoize contract config to prevent unnecessary recreations
  const contractConfig = useMemo(() => ({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: "heirloomCount",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [{ type: "address" }],
        name: "getUserHeirloomCount",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [{ type: "address" }],
        name: "getUserHeirlooms",
        outputs: [{ type: "uint256[]" }],
        stateMutability: "view",
        type: "function"
      }
    ]
  }), [contractAddress]);

  // Fetch heirloom count
  const { data: heirloomCount, isLoading: countLoading } = useReadContract({
    ...contractConfig,
    functionName: 'heirloomCount',
  });

  // Fetch user heirloom count (only if user is connected)
  const { data: userHeirloomCount, isLoading: userCountLoading } = useReadContract({
    ...contractConfig,
    functionName: 'getUserHeirloomCount',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Fetch user heirlooms (only if user has heirlooms)
  const { data: userHeirlooms, isLoading: heirloomsLoading } = useReadContract({
    ...contractConfig,
    functionName: 'getUserHeirlooms',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!userHeirloomCount && userHeirloomCount > 0,
    },
  });

  // Memoize computed values to prevent unnecessary recalculations
  const heirloomStats = useMemo(() => ({
    totalCount: heirloomCount || 0,
    userCount: userHeirloomCount || 0,
    userHeirloomIds: userHeirlooms || [],
  }), [heirloomCount, userHeirloomCount, userHeirlooms]);

  const isLoading = countLoading || userCountLoading || heirloomsLoading;

  return {
    ...heirloomStats,
    isLoading,
  };
};
