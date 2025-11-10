"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useWalletClient, usePublicClient, useChainId } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Wallet, Lock } from "lucide-react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { useFhevm } from "@/fhevm/useFhevm";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringInMemoryStorage } from "@/fhevm/GenericStringStorage";

const BalanceVerifier = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { toast } = useToast();

  const [balance, setBalance] = useState<string>("");
  const [spending, setSpending] = useState<string>("");
  const [encryptedBalance, setEncryptedBalance] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const fhevmDecryptionSignatureStorage = useRef(new GenericStringInMemoryStorage());

  // Get EIP1193 provider from walletClient
  const eip1193Provider = useCallback(() => {
    if (walletClient && 'request' in walletClient) {
      return walletClient as ethers.Eip1193Provider;
    }
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return undefined;
  }, [walletClient]);

  // Convert walletClient to ethers signer
  useEffect(() => {
    if (walletClient) {
      const { account, chain, transport } = walletClient;
      const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      };
      
      try {
        // Create provider from transport
        const provider = new ethers.BrowserProvider(transport as any, network);
        provider.getSigner(account.address)
          .then(setEthersSigner)
          .catch((err) => {
            console.error("Failed to get signer:", err);
            setEthersSigner(undefined);
          });
      } catch (err) {
        console.error("Failed to create provider:", err);
        setEthersSigner(undefined);
      }
    } else {
      setEthersSigner(undefined);
    }
  }, [walletClient]);

  // FHEVM instance
  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider: eip1193Provider(),
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && !!eip1193Provider(),
  });

  // Initialize contract instance
  useEffect(() => {
    if (!ethersSigner) {
      setContract(null);
      return;
    }

    try {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI as any,
        ethersSigner
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Failed to create contract instance:", error);
      setContract(null);
    }
  }, [ethersSigner]);

  const handleSetBalance = useCallback(async () => {
    if (!contract || !address || !balance || !fhevmInstance || !ethersSigner) {
      if (!fhevmInstance) {
        toast({
          title: "FHEVM Not Ready",
          description: "FHEVM instance is not ready. Please wait for initialization.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    try {
      const balanceNum = parseInt(balance);
      if (isNaN(balanceNum) || balanceNum < 0) {
        toast({
          title: "Invalid Balance",
          description: "Please enter a valid positive number.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Encrypt balance using FHEVM
      const input = fhevmInstance.createEncryptedInput(
        CONTRACT_ADDRESS,
        address
      );
      input.add32(balanceNum);
      const encrypted = await input.encrypt();

      // Convert handle to hex string if needed
      let handleHex: string;
      if (typeof encrypted.handles[0] === 'string') {
        handleHex = encrypted.handles[0];
      } else {
        // Handle is Uint8Array, convert to hex
        handleHex = ethers.hexlify(encrypted.handles[0]);
        // Ensure it's 32 bytes (66 chars including 0x)
        if (handleHex.length < 66) {
          const padded = handleHex.slice(2).padStart(64, '0');
          handleHex = `0x${padded}`;
        } else if (handleHex.length > 66) {
          handleHex = handleHex.slice(0, 66);
        }
      }

      // Convert inputProof to hex if needed
      let inputProofHex: string;
      if (typeof encrypted.inputProof === 'string') {
        inputProofHex = encrypted.inputProof;
      } else {
        inputProofHex = ethers.hexlify(encrypted.inputProof);
      }

      // Call contract
      console.log("Setting balance...", {
        balance: balanceNum,
        encryptedHandle: handleHex.substring(0, 20) + "...",
        contractAddress: CONTRACT_ADDRESS,
        handleHexLength: handleHex.length,
        inputProofHexLength: inputProofHex.length
      });
      
      // Estimate gas first to check if transaction will revert
      console.log("Estimating gas for setBalance...");
      try {
        const gasEstimate = await contract.setBalance.estimateGas(handleHex, inputProofHex);
        console.log("✅ Gas estimate:", gasEstimate.toString());
        console.log("✅ Gas estimation successful - transaction should execute");
      } catch (gasError: any) {
        console.error("❌ Gas estimation failed:", gasError);
        const errorMessage = gasError?.message || String(gasError);
        const errorData = gasError?.data || gasError?.error?.data;
        
        // Try to decode revert reason
        let revertReason = "Unknown error";
        if (errorData) {
          try {
            const decoded = contract.interface.parseError(errorData);
            revertReason = decoded?.name || "Revert";
            console.error("Decoded revert reason:", decoded);
          } catch (e) {
            revertReason = errorMessage;
          }
        } else {
          revertReason = errorMessage;
        }
        
        throw new Error(
          `setBalance will revert: ${revertReason}. ` +
          `Possible causes: 1) Invalid encrypted input, 2) FHE operation failed, 3) Contract address incorrect. ` +
          `Please check: 1) Contract is deployed, 2) FHEVM is working, 3) Try again.`
        );
      }
      
      const tx = await contract.setBalance(handleHex, inputProofHex);
      console.log("Balance transaction sent:", {
        hash: tx.hash,
        to: tx.to,
        from: tx.from,
        expectedContract: CONTRACT_ADDRESS
      });
      
      // Verify transaction is going to correct contract
      if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
        console.error("❌ Transaction is not going to our contract!", {
          expected: CONTRACT_ADDRESS,
          actual: tx.to
        });
        throw new Error(`Transaction is going to wrong address. Expected ${CONTRACT_ADDRESS}, got ${tx.to}`);
      }
      
      const receipt = await tx.wait();
      console.log("Balance transaction confirmed:", {
        status: receipt?.status,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        gasLimit: receipt?.gasLimit?.toString(),
        logs: receipt?.logs?.length || 0,
        to: receipt?.to,
        from: receipt?.from
      });
      
      if (!receipt || receipt.status !== 1) {
        throw new Error("Transaction failed");
      }
      
      // Check if transaction was sent to correct contract
      if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
        console.error("❌ Transaction was not sent to our contract!", {
          expected: CONTRACT_ADDRESS,
          actual: receipt.to
        });
        throw new Error(`Transaction was sent to wrong address. Expected ${CONTRACT_ADDRESS}, got ${receipt.to}`);
      }
      
      // Check gas usage - FHE operations should use significant gas
      const gasUsed = receipt.gasUsed ? Number(receipt.gasUsed) : 0;
      console.log("Gas usage:", gasUsed);
      if (gasUsed < 50000) {
        console.warn("⚠️ Gas usage is very low - transaction might not have executed properly");
      }
      
      // Verify BalanceSet event was emitted (like privateself checks for events)
      const iface = contract.interface;
      let foundBalanceSetEvent = false;
      let allContractLogs: any[] = [];
      
      if (receipt.logs) {
        console.log("Checking transaction logs...", {
          totalLogs: receipt.logs.length,
          contractAddress: CONTRACT_ADDRESS
        });
        
        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          console.log(`Log ${i}:`, {
            address: log.address,
            topics: log.topics?.length || 0,
            dataLength: log.data?.length || 0
          });
          
          if (log.address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
            allContractLogs.push(log);
            console.log(`Log ${i} is from our contract`);
            
            try {
              const parsedLog = iface.parseLog({
                topics: log.topics as string[],
                data: log.data
              });
              console.log(`Parsed log ${i}:`, {
                name: parsedLog?.name,
                args: parsedLog?.args
              });
              
              if (parsedLog?.name === "BalanceSet") {
                foundBalanceSetEvent = true;
                console.log("✅ BalanceSet event found in transaction!");
                break;
              }
            } catch (e: any) {
              console.warn(`Failed to parse log ${i}:`, e.message);
              // Try to match by topic hash
              if (log.topics && log.topics.length > 0) {
                const eventTopic = iface.getEvent("BalanceSet").topicHash;
                if (log.topics[0] === eventTopic) {
                  console.log("⚠️ Found BalanceSet event by topic hash, but failed to parse");
                  foundBalanceSetEvent = true;
                  break;
                }
              }
            }
          }
        }
      }
      
      console.log("Event check summary:", {
        foundBalanceSetEvent,
        totalContractLogs: allContractLogs.length,
        totalLogs: receipt.logs?.length || 0
      });
      
      if (!foundBalanceSetEvent) {
        console.error("❌ BalanceSet event not found in transaction logs!");
        console.error("❌ This could mean:");
        console.error("  1. Transaction did not execute the setBalance function");
        console.error("  2. Contract address is incorrect");
        console.error("  3. Transaction reverted silently");
        console.error("  4. Event was not emitted (contract bug)");
        
        // If gas usage is reasonable, the function might have executed but event parsing failed
        // In that case, we'll still set the state and let verifySpending test it
        if (gasUsed > 50000 && allContractLogs.length > 0) {
          console.warn("⚠️ Gas usage suggests function executed, but event not found");
          console.warn("⚠️ Proceeding anyway - verifySpending will test if balance is set");
        } else {
          throw new Error(
            "BalanceSet event not found. The balance might not have been set correctly. " +
            `Gas used: ${gasUsed}, Contract logs: ${allContractLogs.length}. Please check the transaction on block explorer.`
          );
        }
      }
      
      // Wait for state to update (FHEVM may need time)
      await new Promise(resolve => setTimeout(resolve, 2000));

      setEncryptedBalance(handleHex);
      toast({
        title: "Balance Set",
        description: "Your encrypted balance has been set successfully. You can now verify spending.",
      });
    } catch (error: any) {
      console.error("Error setting balance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set balance.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, fhevmInstance, balance, ethersSigner, toast]);

  const handleVerifySpending = useCallback(async () => {
    if (!contract || !address || !spending || !fhevmInstance || !ethersSigner || !publicClient) {
      if (!fhevmInstance) {
        toast({
          title: "FHEVM Not Ready",
          description: "FHEVM instance is not ready. Please wait for initialization.",
          variant: "destructive",
        });
      }
      if (!publicClient) {
        toast({
          title: "Public Client Not Ready",
          description: "Public client is not ready. Please check your connection.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    try {
      const spendingNum = parseInt(spending);
      if (isNaN(spendingNum) || spendingNum < 0) {
        toast({
          title: "Invalid Spending",
          description: "Please enter a valid positive number.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Encrypt spending amount using FHEVM
      const input = fhevmInstance.createEncryptedInput(
        CONTRACT_ADDRESS,
        address
      );
      input.add32(spendingNum);
      const encrypted = await input.encrypt();

      // Convert handle to hex string if needed
      let spendingHandleHex: string;
      if (typeof encrypted.handles[0] === 'string') {
        spendingHandleHex = encrypted.handles[0];
      } else {
        // Handle is Uint8Array, convert to hex
        spendingHandleHex = ethers.hexlify(encrypted.handles[0]);
        // Ensure it's 32 bytes (66 chars including 0x)
        if (spendingHandleHex.length < 66) {
          const padded = spendingHandleHex.slice(2).padStart(64, '0');
          spendingHandleHex = `0x${padded}`;
        } else if (spendingHandleHex.length > 66) {
          spendingHandleHex = spendingHandleHex.slice(0, 66);
        }
      }

      // Convert inputProof to hex if needed
      let spendingInputProofHex: string;
      if (typeof encrypted.inputProof === 'string') {
        spendingInputProofHex = encrypted.inputProof;
      } else {
        spendingInputProofHex = ethers.hexlify(encrypted.inputProof);
      }

      // Prepare decryption signature before calling contract
      const sig = await FhevmDecryptionSignature.loadOrSign(
        fhevmInstance,
        [CONTRACT_ADDRESS as `0x${string}`],
        ethersSigner,
        fhevmDecryptionSignatureStorage.current
      );

      if (!sig) {
        toast({
          title: "Decryption Error",
          description: "Unable to build FHEVM decryption signature.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if balance was set (using encryptedBalance state)
      if (!encryptedBalance) {
        toast({
          title: "Balance Not Set",
          description: "Please set your balance first before verifying spending. Click 'Set Balance' and wait for confirmation.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Verify balance is set - use a more lenient check
      // For FHE types, getBalance may return 0x even if balance is set (ethers can't decode it)
      // So we rely on the encryptedBalance state which is set after successful setBalance transaction
      console.log("Checking if balance is set...");
      console.log("Encrypted balance state:", {
        hasState: !!encryptedBalance,
        balanceHandle: encryptedBalance?.substring(0, 20) + "..."
      });
      
      // If we have encryptedBalance in state, it means setBalance transaction succeeded
      // We can optionally verify in contract, but don't fail if ethers can't decode it
      if (encryptedBalance) {
        try {
          const provider = ethersSigner.provider;
          if (provider) {
            // Try to verify balance in contract (non-blocking)
            const balanceData = contract.interface.encodeFunctionData("getBalance", [address]);
            const balanceRawResult = await provider.call({
              to: CONTRACT_ADDRESS,
              data: balanceData,
            });
            
            console.log("Balance check result (raw):", {
              rawData: balanceRawResult?.substring(0, 50) + "...",
              dataLength: balanceRawResult?.length,
              isEmpty: balanceRawResult === "0x"
            });
            
            // If we get a non-empty result, try to extract it
            if (balanceRawResult && balanceRawResult !== "0x" && balanceRawResult.length >= 66) {
              let balanceHandle: string;
              if (balanceRawResult.length >= 130) {
                balanceHandle = "0x" + balanceRawResult.slice(-64);
              } else {
                balanceHandle = balanceRawResult;
              }
              
              console.log("Balance found in contract:", balanceHandle.substring(0, 20) + "...");
            } else {
              // This is OK - FHE types may return 0x even if set (ethers can't decode)
              console.log("⚠️ Contract returned 0x (may be decoding issue, but balance state exists)");
            }
          }
        } catch (balanceCheckError: any) {
          // Non-critical - just log it
          console.warn("Balance check in contract failed (non-critical):", balanceCheckError.message);
        }
        
        console.log("✅ Balance check passed (using state)");
      } else {
        // No balance state - definitely not set
        toast({
          title: "Balance Not Set",
          description: "Please set your balance first before verifying spending. Click 'Set Balance' and wait for confirmation.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Balance check passed:", {  
        encryptedBalance: encryptedBalance.substring(0, 20) + "..."
      });

      // Verify that balance is actually set in the contract
      // This is critical - if balance is not set, verifySpending will fail
      // First check if we have encryptedBalance state (set after successful setBalance)
      if (!encryptedBalance) {
        console.error("❌ No encryptedBalance state - balance was not set!");
        toast({
          title: "Balance Not Set",
          description: "Please set your balance first by clicking 'Set Balance' and wait for confirmation.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Verifying balance is set in contract...");
      try {
        const provider = ethersSigner.provider;
        if (provider) {
          // Get the current block to check recent events
          const currentBlock = await provider.getBlockNumber();
          console.log("Current block:", currentBlock);
          
          // Try to find BalanceSet event in recent blocks (last 1000 blocks for more coverage)
          const filter = contract.filters.BalanceSet(address);
          const fromBlock = Math.max(0, currentBlock - 1000);
          const events = await contract.queryFilter(filter, fromBlock, currentBlock);
          
          console.log("BalanceSet events found:", events.length, `(searched from block ${fromBlock} to ${currentBlock})`);
          if (events.length === 0) {
            console.warn("⚠️ No BalanceSet event found in recent blocks");
            console.warn("⚠️ But we have encryptedBalance state, so proceeding anyway");
            console.warn("⚠️ If verifySpending fails, please try setting balance again");
            // Don't block - if we have encryptedBalance state, the transaction likely succeeded
            // The event might be in an older block or there might be a query issue
          } else {
            const latestEvent = events[events.length - 1];
            const eventArgs = 'args' in latestEvent ? latestEvent.args : null;
            console.log("✅ Latest BalanceSet event:", {
              blockNumber: latestEvent.blockNumber,
              transactionHash: latestEvent.transactionHash,
              timestamp: eventArgs && eventArgs[1] ? new Date(Number(eventArgs[1]) * 1000).toISOString() : 'unknown',
              blocksAgo: currentBlock - Number(latestEvent.blockNumber)
            });
            console.log("✅ BalanceSet event confirmed - balance is set in contract");
          }
        }
      } catch (eventCheckError: any) {
        console.warn("⚠️ Failed to verify BalanceSet event (non-critical):", eventCheckError.message);
        console.warn("⚠️ Proceeding with encryptedBalance state - if verifySpending fails, try setting balance again");
        // Don't block - if we have encryptedBalance state, proceed
      }

      // Call contract - verifySpending returns ebool but we can't decode it directly
      // So we send the transaction and then query the result
      let resultHandle: string | undefined = undefined;
      const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
      
      try {
        console.log("Sending verifySpending transaction...", {
          spending: spendingNum,
          encryptedSpending: spendingHandleHex.substring(0, 20) + "..."
        });
        
        // Try to get result from transaction return value first
        // verifySpending returns ebool, but ethers may not be able to decode it
        console.log("Attempting to call verifySpending with staticCall to get return value...");
        let resultHandleFromTx: string | undefined = undefined;
        try {
          // Try staticCall to get the return value without sending a transaction
          const txResult = await contract.verifySpending.staticCall(spendingHandleHex, spendingInputProofHex);
          console.log("staticCall result:", {
            hasResult: !!txResult,
            resultType: typeof txResult,
            resultValue: txResult
          });
          
          // Convert to hex string
          if (txResult) {
            if (typeof txResult === "string") {
              resultHandleFromTx = txResult;
            } else {
              resultHandleFromTx = ethers.hexlify(txResult);
            }
            // Ensure it's 32 bytes
            if (resultHandleFromTx.length < 66) {
              const padded = resultHandleFromTx.slice(2).padStart(64, '0');
              resultHandleFromTx = `0x${padded}`;
            } else if (resultHandleFromTx.length > 66) {
              resultHandleFromTx = resultHandleFromTx.slice(0, 66);
            }
            console.log("✅ Got result handle from staticCall:", resultHandleFromTx.substring(0, 20) + "...");
          }
        } catch (staticCallError: any) {
          console.warn("staticCall failed (expected for FHE types):", staticCallError.message);
        }
        
        // Send transaction to actually execute verifySpending
        const tx = await contract.verifySpending(spendingHandleHex, spendingInputProofHex);
        console.log("Transaction sent:", {
          hash: tx.hash,
          to: tx.to,
          from: tx.from,
          value: tx.value?.toString()
        });
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", {
          status: receipt?.status,
          blockNumber: receipt?.blockNumber,
          gasUsed: receipt?.gasUsed?.toString(),
          logs: receipt?.logs?.length || 0,
          to: receipt?.to,
          from: receipt?.from
        });
        
        if (!receipt || receipt.status !== 1) {
          throw new Error(`Transaction failed with status: ${receipt?.status}`);
        }
        
        // Check if transaction actually called our contract
        if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
          console.error("⚠️ Transaction was not sent to our contract!", {
            expected: CONTRACT_ADDRESS,
            actual: receipt.to
          });
          throw new Error("Transaction was not sent to the correct contract address");
        }
        
        // Check transaction logs to see if VerificationPerformed event was emitted
        // This is the most reliable way to verify the function executed
        const iface = contract.interface;
        let foundVerificationEvent = false;
        if (receipt.logs) {
          for (const log of receipt.logs) {
            if (log.address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
              try {
                const parsedLog = iface.parseLog({
                  topics: log.topics as string[],
                  data: log.data
                });
                if (parsedLog?.name === "VerificationPerformed") {
                  foundVerificationEvent = true;
                  console.log("✅ VerificationPerformed event found in transaction!");
                  break;
                }
              } catch (e) {
                // Not our event, continue
              }
            }
          }
        }
        
        if (!foundVerificationEvent) {
          // Check gas usage as additional diagnostic
          const gasUsed = receipt.gasUsed ? Number(receipt.gasUsed) : 0;
          console.error("❌ VerificationPerformed event not found in transaction logs!");
          console.error("Gas usage:", gasUsed);
          console.error("❌ This means verifySpending function did not execute properly");
          
          // Provide more specific error message based on gas usage
          if (gasUsed < 50000) {
            throw new Error(
              "verifySpending did not execute. Gas usage is very low, suggesting the transaction reverted early. " +
              "Most likely cause: Balance is not set correctly. Please: 1) Click 'Set Balance' first, 2) Wait for confirmation, 3) Try again."
            );
          } else {
            throw new Error(
              "verifySpending did not execute. VerificationPerformed event not found. " +
              "Possible causes: 1) Balance not set correctly, 2) FHE operation failed, 3) Transaction reverted. " +
              "Please: 1) Set balance first, 2) Check transaction on block explorer, 3) Try setting balance again."
            );
          }
        }
        
        // Wait a bit for state to update (FHEVM may need time)
        console.log("Waiting for state to update...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Query result using provider.call() to get raw data (avoid ethers decoding issues)
        // This is more reliable for FHE types that may return 0x
        console.log("Querying verification result from contract...", {
          contractAddress: CONTRACT_ADDRESS,
          address
        });
        
        // Don't redeclare resultHandle - use the one from outer scope
        let retries = 5;
        
        while (retries > 0 && !resultHandle) {
          try {
            const provider = ethersSigner.provider;
            if (!provider) {
              throw new Error("Provider not available");
            }
            
            // Encode function call
            const data = contract.interface.encodeFunctionData("getVerificationResult", [address]);
            
            // Call contract directly to get raw bytes
            const rawResult = await provider.call({
              to: CONTRACT_ADDRESS,
              data: data,
            });
            
            console.log(`Query attempt ${6 - retries}: Raw result:`, {
              hasData: !!rawResult,
              dataLength: rawResult?.length,
              dataPreview: rawResult?.substring(0, 50),
              fullData: rawResult
            });
            
            // Check if result is empty
            if (!rawResult || rawResult === "0x" || rawResult.length < 66) {
              console.log(`Query attempt ${6 - retries}: Result is empty (0x or too short)`);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
              continue;
            }
            
            // Extract the bytes32 value from the return data
            // Solidity returns are padded: 0x + 32 bytes of padding + 32 bytes of actual data
            // For a single bytes32 return, extract the last 32 bytes (64 hex chars)
            let handleHex: string;
            if (rawResult.length >= 130) {
              // Extract the last 32 bytes (64 hex chars) after 0x
              handleHex = "0x" + rawResult.slice(-64);
            } else if (rawResult.length === 66) {
              // Already a 32-byte value
              handleHex = rawResult;
            } else {
              // Try to decode using contract interface (might fail for FHE types)
              try {
                const decoded = contract.interface.decodeFunctionResult("getVerificationResult", rawResult);
                const rawValue = decoded[0];
                if (typeof rawValue === "string") {
                  handleHex = rawValue;
                } else {
                  handleHex = ethers.hexlify(rawValue);
                }
              } catch (decodeError: any) {
                // If decoding fails, use raw result as fallback
                handleHex = rawResult.length >= 66 ? rawResult : `0x${rawResult.slice(2).padStart(64, '0')}`;
              }
            }
            
            // Ensure it's 32 bytes (66 chars including 0x)
            if (handleHex.length < 66) {
              const padded = handleHex.slice(2).padStart(64, '0');
              handleHex = `0x${padded}`;
            } else if (handleHex.length > 66) {
              handleHex = handleHex.slice(0, 66);
            }
            
            console.log(`Query attempt ${6 - retries}: Processed result:`, {
              resultHandle: handleHex.substring(0, 20) + "...",
              isZero: handleHex === zeroHash,
              isEmpty: handleHex === "0x",
              length: handleHex?.length
            });
            
            if (handleHex && handleHex !== zeroHash && handleHex !== "0x") {
              resultHandle = handleHex;
              console.log("✅ Got valid result handle:", resultHandle.substring(0, 20) + "...");
              break;
            } else {
              console.log("Result is empty, retrying...");
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          } catch (queryError: any) {
            console.error(`Query attempt ${6 - retries} failed:`, queryError);
            // If it's a decoding error, the value might not be set yet
            if (queryError.message && queryError.message.includes("could not decode")) {
              console.log("Decoding error - value may not be set yet, retrying...");
            }
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        // Final check
        if (!resultHandle || resultHandle === zeroHash || resultHandle === "0x") {
          throw new Error(
            "Verification result is empty after transaction. " +
            "Possible causes: 1) Balance was not set correctly, 2) FHE comparison failed, " +
            "3) Transaction did not execute properly. Please try setting balance again."
          );
        }
        
        console.log("✅ Result handle obtained:", resultHandle.substring(0, 20) + "...");
        
      } catch (txError: any) {
        console.error("Transaction error:", txError);
        toast({
          title: "Error",
          description: txError.message || "Failed to verify spending. Please make sure you have set a balance first and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Ensure resultHandle is a valid string format for FHEVM
      if (!resultHandle || typeof resultHandle !== "string") {
        throw new Error(`Invalid result handle format: ${typeof resultHandle}. Expected string.`);
      }
      
      // Ensure handle is a valid hex string (66 chars: 0x + 64 hex chars)
      if (resultHandle.length !== 66 || !resultHandle.startsWith("0x")) {
        console.warn("⚠️ Result handle format may be incorrect, normalizing...", {
          length: resultHandle.length,
          startsWith0x: resultHandle.startsWith("0x"),
          handle: resultHandle.substring(0, 20) + "..."
        });
        // Normalize to 32 bytes
        if (!resultHandle.startsWith("0x")) {
          resultHandle = "0x" + resultHandle;
        }
        if (resultHandle.length < 66) {
          const padded = resultHandle.slice(2).padStart(64, '0');
          resultHandle = `0x${padded}`;
        } else if (resultHandle.length > 66) {
          resultHandle = resultHandle.slice(0, 66);
        }
        console.log("✅ Normalized result handle:", resultHandle.substring(0, 20) + "...");
      }
      
      console.log("Decrypting result...", {
        handle: resultHandle.substring(0, 20) + "...",
        handleType: typeof resultHandle,
        handleLength: resultHandle.length,
        contractAddress: CONTRACT_ADDRESS
      });
      
      // Decrypt result using FHEVM (like privateself)
      const decryptedResults = await fhevmInstance.userDecrypt(
        [{ handle: resultHandle, contractAddress: CONTRACT_ADDRESS }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      console.log("Decryption result:", {
        hasResult: !!decryptedResults[resultHandle],
        resultValue: decryptedResults[resultHandle],
        resultType: typeof decryptedResults[resultHandle],
        allKeys: Object.keys(decryptedResults)
      });

      // ebool is stored as 0 or 1 in the result
      // Handle both BigInt and number types
      const decryptedValue = decryptedResults[resultHandle];
      if (decryptedValue === undefined) {
        throw new Error("Decryption failed: result is undefined. The handle might be incorrect or decryption signature is invalid.");
      }
      
      const result = decryptedValue === 1n || decryptedValue === BigInt(1) || decryptedValue === true || (typeof decryptedValue === "number" && decryptedValue === 1);

      setVerificationResult(result);
      toast({
        title: result ? "Allowed" : "Denied",
        description: result 
          ? "Your balance is sufficient for this spending." 
          : "Your balance is insufficient for this spending.",
      });
    } catch (error: any) {
      console.error("Error verifying spending:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify spending.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, fhevmInstance, spending, ethersSigner, publicClient, toast]);

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Please connect your wallet to use the Encrypted Balance Verifier
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encrypted Balance Verifier
          </CardTitle>
          <CardDescription>
            Set your encrypted balance and verify spending amounts without revealing actual values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* FHEVM Status */}
          {fhevmStatus === "error" && fhevmError && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>⚠️ FHEVM Initialization Error</strong>
                <br />
                <span className="text-sm mt-2 block">
                  {fhevmError.message || "Failed to initialize FHEVM. Please check your connection and network."}
                  <br />
                  <span className="text-xs mt-2 block text-muted-foreground">
                    Make sure you're connected to a FHEVM-compatible network (Hardhat local or Sepolia testnet).
                  </span>
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {fhevmStatus === "loading" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <AlertDescription>
                Initializing FHEVM and contract connection...
              </AlertDescription>
            </Alert>
          )}
          
          {fhevmStatus === "ready" && fhevmInstance && (
            <Alert className="border-green-500">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              <AlertDescription>
                FHEVM is ready. You can now set balance and verify spending.
              </AlertDescription>
            </Alert>
          )}

          {/* Set Balance Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Set Balance (Encrypted)</Label>
              <div className="flex gap-2">
                <Input
                  id="balance"
                  type="number"
                  placeholder="Enter your balance"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  disabled={isLoading || fhevmStatus !== "ready" || !fhevmInstance}
                />
                <Button
                  onClick={handleSetBalance}
                  disabled={isLoading || !balance || fhevmStatus !== "ready" || !fhevmInstance || !contract || !ethersSigner}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Set Balance"
                  )}
                </Button>
              </div>
              {fhevmStatus === "loading" && (
                <p className="text-sm text-muted-foreground">
                  Initializing FHEVM...
                </p>
              )}
              {fhevmStatus === "error" && (
                <p className="text-sm text-destructive">
                  FHEVM initialization failed. Please check your connection.
                </p>
              )}
            </div>
            {encryptedBalance && (
              <Alert>
                <AlertDescription>
                  Balance encrypted and stored on-chain
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Verify Spending Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spending">Verify Spending Amount (Encrypted)</Label>
              <div className="flex gap-2">
                <Input
                  id="spending"
                  type="number"
                  placeholder="Enter spending amount"
                  value={spending}
                  onChange={(e) => setSpending(e.target.value)}
                  disabled={isLoading || !encryptedBalance}
                />
                <Button
                  onClick={handleVerifySpending}
                  disabled={isLoading || !spending || !encryptedBalance || fhevmStatus !== "ready" || !fhevmInstance || !contract || !ethersSigner}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {verificationResult !== null && (
            <Alert className={verificationResult ? "border-green-500" : "border-red-500"}>
              <div className="flex items-center gap-2">
                {verificationResult ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <AlertDescription className="font-semibold">
                  {verificationResult ? "ALLOWED" : "DENIED"}
                </AlertDescription>
              </div>
              <AlertDescription className="mt-2">
                {verificationResult
                  ? "Your balance is sufficient for this spending amount."
                  : "Your balance is insufficient for this spending amount."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceVerifier;



