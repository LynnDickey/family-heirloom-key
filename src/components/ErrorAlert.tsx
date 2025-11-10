import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ErrorAlert = ({ error, onDismiss, showRetry, onRetry }: ErrorAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getErrorIcon = () => {
    if (error.toLowerCase().includes('cancelled') || error.toLowerCase().includes('denied')) {
      return <Info className="h-4 w-4 text-blue-600" />;
    } else if (error.toLowerCase().includes('insufficient') || error.toLowerCase().includes('failed')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-orange-600" />;
  };

  const getErrorTitle = () => {
    if (error.toLowerCase().includes('cancelled') || error.toLowerCase().includes('denied')) {
      return 'Action Cancelled';
    } else if (error.toLowerCase().includes('insufficient')) {
      return 'Insufficient Funds';
    } else if (error.toLowerCase().includes('network')) {
      return 'Network Error';
    }
    return 'Transaction Error';
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <Alert className="relative">
      {getErrorIcon()}
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong className="block font-medium">{getErrorTitle()}</strong>
          <span className="text-sm">{error}</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {showRetry && onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              Retry
            </Button>
          )}
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
