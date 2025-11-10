import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface TransactionError {
  code?: number;
  message: string;
  data?: any;
}

export const useTransactionError = () => {
  const [lastError, setLastError] = useState<TransactionError | null>(null);

  const handleTransactionError = useCallback((error: any) => {
    console.error('Transaction error:', error);

    let userMessage = 'Transaction failed. Please try again.';
    let errorCode = error?.code;

    // Handle common error types
    if (error?.code === 4001) {
      userMessage = 'Transaction was cancelled by user.';
    } else if (error?.code === -32000) {
      userMessage = 'Insufficient funds for transaction.';
    } else if (error?.code === -32002) {
      userMessage = 'Transaction already pending. Please wait.';
    } else if (error?.message?.includes('User denied')) {
      userMessage = 'Transaction was rejected by wallet.';
    } else if (error?.message?.includes('insufficient funds')) {
      userMessage = 'Insufficient funds for gas or transaction.';
    } else if (error?.message?.includes('network')) {
      userMessage = 'Network error. Please check your connection.';
    } else if (error?.message?.includes('nonce')) {
      userMessage = 'Transaction nonce error. Please try again.';
    }

    setLastError({ code: errorCode, message: error?.message || '', data: error });
    toast.error(userMessage);
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return {
    lastError,
    handleTransactionError,
    clearError,
  };
};
