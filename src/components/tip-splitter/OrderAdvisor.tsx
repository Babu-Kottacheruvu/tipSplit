"use client";

import React, { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { PastSpendingItem } from "@/lib/types";
import { suggestOrderSize, type OrderSuggestionOutput } from "@/ai/flows/order-suggestion";
import { PastBillEntryForm } from "./PastBillEntryForm";
import { Lightbulb, Wand2, Trash2, Info, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface OrderAdvisorProps {
  currentBillAmount: number | null;
  currentTipPercentage: number | null;
  currentNumberOfPeople: number | null;
  pastBills: PastSpendingItem[];
  onAddPastBill: (bill: Omit<PastSpendingItem, 'id'>) => void;
  onDeletePastBill: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  aiSuggestion: OrderSuggestionOutput | null;
  setAiSuggestion: (suggestion: OrderSuggestionOutput | null) => void;
}

const CURRENCY_SYMBOL = "$";

export function OrderAdvisor({
  currentBillAmount,
  currentTipPercentage,
  currentNumberOfPeople,
  pastBills,
  onAddPastBill,
  onDeletePastBill,
  isLoading,
  setIsLoading,
  aiSuggestion,
  setAiSuggestion,
}: OrderAdvisorProps) {
  const { toast } = useToast();
  const [showPastBillForm, setShowPastBillForm] = useState(false);

  const handleGetSuggestion = async () => {
    if (currentBillAmount === null || currentTipPercentage === null || currentNumberOfPeople === null) {
      toast({
        title: "Incomplete Current Bill",
        description: "Please fill in the current bill details first.",
        variant: "destructive",
      });
      return;
    }

    if (pastBills.length === 0) {
       toast({
        title: "No Past Data",
        description: "Please add at least one past bill to get a suggestion.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAiSuggestion(null);
    try {
      const suggestion = await suggestOrderSize({
        pastSpending: pastBills.map(({ id, ...rest }) => rest), // Remove ID for AI flow
        currentBillAmount,
        currentTipPercentage,
        currentNumberOfPeople,
      });
      setAiSuggestion(suggestion);
      toast({
        title: "Suggestion Ready!",
        description: "The order advisor has analyzed your spending.",
      });
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast({
        title: "Error",
        description: "Could not get an order suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="order-advisor">
        <AccordionTrigger className="text-xl font-semibold hover:no-underline">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            <span>Order Advisor</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 space-y-6">
          <CardDescription className="text-base">
            Get an AI-powered suggestion on whether your current order might be excessive based on your past spending habits.
          </CardDescription>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Past Spending History</CardTitle>
               <CardDescription>Add or manage your past bill entries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastBills.length > 0 ? (
                <ScrollArea className="h-48 w-full rounded-md border p-2">
                  <ul className="space-y-2">
                    {pastBills.map((bill) => (
                      <li key={bill.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <div>
                          <p className="font-medium">
                            {CURRENCY_SYMBOL}{bill.billAmount.toFixed(2)} ({bill.tipPercentage}% tip, {bill.numberOfPeople} {bill.numberOfPeople === 1 ? "person" : "people"})
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onDeletePastBill(bill.id)} aria-label="Delete past bill">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No past bills recorded yet.</p>
              )}
              <Button variant="outline" onClick={() => setShowPastBillForm(!showPastBillForm)} className="w-full">
                {showPastBillForm ? "Hide Form" : "Add New Past Bill"}
              </Button>
              {showPastBillForm && <PastBillEntryForm onAddPastBill={onAddPastBill} />}
            </CardContent>
          </Card>

          <Button onClick={handleGetSuggestion} disabled={isLoading || pastBills.length === 0} className="w-full text-lg py-6">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            Get Order Suggestion
          </Button>

          {aiSuggestion && (
            <Card className={`mt-6 ${aiSuggestion.isExcessive ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-500/10'}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  {aiSuggestion.isExcessive ? (
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                  <span>Suggestion Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-semibold ${aiSuggestion.isExcessive ? 'text-destructive' : 'text-green-700'}`}>
                  This order is {aiSuggestion.isExcessive ? "likely excessive" : "likely not excessive"}.
                </p>
                <Separator className="my-3" />
                <p className="text-base text-muted-foreground font-medium">Reasoning:</p>
                <p className="text-base">{aiSuggestion.reasoning}</p>
              </CardContent>
            </Card>
          )}
           {pastBills.length === 0 && !isLoading && (
             <div className="flex items-center space-x-2 text-sm text-muted-foreground p-3 border border-dashed rounded-md">
                <Info className="h-5 w-5 text-accent" />
                <span>Add some past bills to enable order suggestions.</span>
             </div>
           )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
