"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalculationDisplayProps {
  tipAmount: number;
  totalBill: number;
  amountPerPerson: number;
  currencySymbol?: string;
}

const CURRENCY_SYMBOL = "$";

export function CalculationDisplay({
  tipAmount,
  totalBill,
  amountPerPerson,
  currencySymbol = CURRENCY_SYMBOL,
}: CalculationDisplayProps) {
  const formatCurrency = (value: number) => {
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-primary">Calculation Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
          <span className="text-lg font-medium text-secondary-foreground">Tip Amount:</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(tipAmount)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
          <span className="text-lg font-medium text-secondary-foreground">Total Bill (with Tip):</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(totalBill)}</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-lg mt-2">
          <span className="text-xl font-semibold">Amount Per Person:</span>
          <span className="text-2xl font-extrabold">{formatCurrency(amountPerPerson)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
