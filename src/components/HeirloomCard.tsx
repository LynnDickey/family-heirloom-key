import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InheritanceRequestDialog } from "./InheritanceRequestDialog";

interface Heirloom {
  tokenId: number;
  title: string;
  description: string;
  creator: string;
  designatedHeir: string;
  creationTime: number;
  inheritanceDeadline: number;
  isActive: boolean;
  inheritanceTriggered: boolean;
}

// Performance optimized with React.memo to prevent unnecessary re-renders
export const HeirloomCard = React.memo(({ heirloom }: { heirloom: Heirloom }) => {
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString();

  const isExpired = Date.now() / 1000 > heirloom.inheritanceDeadline;
  const canRequestInheritance = heirloom.isActive && !heirloom.inheritanceTriggered && isExpired;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{heirloom.title}</CardTitle>
          <Badge variant={heirloom.isActive ? "default" : "secondary"}>
            {heirloom.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{heirloom.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Creator:</span>
            <span className="font-mono">{formatAddress(heirloom.creator)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Designated Heir:</span>
            <span className="font-mono">{formatAddress(heirloom.designatedHeir)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Created:</span>
            <span>{formatDate(heirloom.creationTime)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Deadline:</span>
            <span className={isExpired ? "text-red-600 font-medium" : ""}>
              {formatDate(heirloom.inheritanceDeadline)}
            </span>
          </div>

          {heirloom.inheritanceTriggered && (
            <div className="text-green-600 font-medium text-center py-2">
              Inheritance Triggered
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {canRequestInheritance && (
            <InheritanceRequestDialog tokenId={heirloom.tokenId} />
          )}
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

HeirloomCard.displayName = 'HeirloomCard';
