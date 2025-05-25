"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { TipSplitterForm } from "./TipSplitterForm";
import { CalculationDisplay } from "./CalculationDisplay";
import { RoundingOptions } from "./RoundingOptions";
import { OrderAdvisor } from "./OrderAdvisor";
import type { PastSpendingItem, TipSplitterFormValues } from "@/lib/types";
import type { OrderSuggestionOutput } from "@/ai/flows/order-suggestion";
import { Calculator, RotateCcw } from "lucide-react";
import { Form } from "@/components/ui/form"; // Added import

const billFormSchema = z.object({
  billAmount: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Bill amount must be a positive number.",
  }),
  numberOfPeople: z.string().refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1;
  }, {
    message: "Number of people must be at least 1.",
  }),
});

const CURRENCY_SYMBOL = "$";

export default function TipSplitApp() {
  const { toast } = useToast();

  const [selectedTipTab, setSelectedTipTab] = useState<string>("18");
  const [customTipPercentage, setCustomTipPercentage] = useState<string>("");
  const [numberOfPeopleState, setNumberOfPeopleState] = useState<number>(1); // Separate state for +/- buttons
  
  const [rounding, setRounding] = useState<"none" | "up" | "down">("none");

  const [tipAmount, setTipAmount] = useState<number>(0);
  const [totalBill, setTotalBill] = useState<number>(0);
  const [amountPerPerson, setAmountPerPerson] = useState<number>(0);

  const [pastBills, setPastBills] = useState<PastSpendingItem[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<OrderSuggestionOutput | null>(null);
  
  const form = useForm<TipSplitterFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      billAmount: "",
      numberOfPeople: "1",
    },
  });
  
  const { watch, reset: resetFormHook, control, setValue: setFormValue } = form;
  const watchedBillAmount = watch("billAmount");
  const watchedNumberOfPeople = watch("numberOfPeople"); // RHF value

  // Sync RHF numberOfPeople with numberOfPeopleState
  useEffect(() => {
    setFormValue("numberOfPeople", String(numberOfPeopleState));
  }, [numberOfPeopleState, setFormValue]);

  // Load past bills from localStorage
  useEffect(() => {
    const storedBills = localStorage.getItem("pastBills");
    if (storedBills) {
      setPastBills(JSON.parse(storedBills));
    }
  }, []);

  // Save past bills to localStorage
  useEffect(() => {
    localStorage.setItem("pastBills", JSON.stringify(pastBills));
  }, [pastBills]);

  const effectiveTipPercentage = React.useMemo(() => {
    if (selectedTipTab === "custom") {
      const customVal = parseFloat(customTipPercentage);
      return isNaN(customVal) || customVal < 0 ? 0 : customVal;
    }
    return parseFloat(selectedTipTab);
  }, [selectedTipTab, customTipPercentage]);


  const calculateResults = useCallback(() => {
    const bill = parseFloat(watchedBillAmount);
    const people = parseInt(String(numberOfPeopleState)) || 1; // Use state for people

    if (isNaN(bill) || bill <= 0 || isNaN(people) || people <= 0) {
      setTipAmount(0);
      setTotalBill(0);
      setAmountPerPerson(0);
      return;
    }

    const tip = bill * (effectiveTipPercentage / 100);
    const total = bill + tip;
    let perPerson = total / people;

    if (rounding === "up") {
      perPerson = Math.ceil(perPerson);
    } else if (rounding === "down") {
      perPerson = Math.floor(perPerson);
    }

    setTipAmount(tip);
    setTotalBill(total);
    setAmountPerPerson(perPerson);
  }, [watchedBillAmount, numberOfPeopleState, effectiveTipPercentage, rounding]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const handleAddPastBill = (bill: Omit<PastSpendingItem, 'id'>) => {
    setPastBills(prev => [...prev, { ...bill, id: Date.now().toString() }]);
    toast({ title: "Past Bill Added", description: "Successfully added to your history." });
  };

  const handleDeletePastBill = (id: string) => {
    setPastBills(prev => prev.filter(b => b.id !== id));
    toast({ title: "Past Bill Deleted", description: "Successfully removed from your history." });
  };
  
  const handleResetForm = () => {
    resetFormHook({ billAmount: "", numberOfPeople: "1" });
    setSelectedTipTab("18");
    setCustomTipPercentage("");
    setNumberOfPeopleState(1);
    setRounding("none");
    setAiSuggestion(null);
    // Calculations will auto-update via useEffect
    toast({ title: "Form Reset", description: "All fields have been cleared."});
  };

  const currentBillForAI = parseFloat(watchedBillAmount) > 0 ? parseFloat(watchedBillAmount) : null;
  const currentTipForAI = effectiveTipPercentage;
  const currentPeopleForAI = numberOfPeopleState > 0 ? numberOfPeopleState : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100">
      <main className="w-full max-w-2xl space-y-8">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Calculator className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight text-gray-800">
              TipSplit
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Easily calculate tips and split bills with friends.
          </p>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-primary">Bill Calculator</CardTitle>
            <CardDescription className="text-base">
              Enter your bill details to calculate the tip and split.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}> {/* react-hook-form Form provider */}
              {/* TipSplitterForm doesn't need form onSubmit, it's for inputs */}
              <TipSplitterForm
                control={control}
                selectedTipTab={selectedTipTab}
                setSelectedTipTab={setSelectedTipTab}
                customTipPercentage={customTipPercentage}
                setCustomTipPercentage={setCustomTipPercentage}
                effectiveTipPercentage={effectiveTipPercentage}
                setNumberOfPeople={setNumberOfPeopleState}
                numberOfPeople={numberOfPeopleState}
              />
            </Form>
            <Separator />
            <RoundingOptions rounding={rounding} setRounding={setRounding} />
            <Separator />
            <CalculationDisplay
              tipAmount={tipAmount}
              totalBill={totalBill}
              amountPerPerson={amountPerPerson}
              currencySymbol={CURRENCY_SYMBOL}
            />
          </CardContent>
           <CardFooter>
            <Button variant="outline" onClick={handleResetForm} className="w-full text-base">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Calculator
            </Button>
          </CardFooter>
        </Card>

        <OrderAdvisor
          currentBillAmount={currentBillForAI}
          currentTipPercentage={currentTipForAI}
          currentNumberOfPeople={currentPeopleForAI}
          pastBills={pastBills}
          onAddPastBill={handleAddPastBill}
          onDeletePastBill={handleDeletePastBill}
          isLoading={isAiLoading}
          setIsLoading={setIsAiLoading}
          aiSuggestion={aiSuggestion}
          setAiSuggestion={setAiSuggestion}
        />
        
        <footer className="text-center text-sm text-muted-foreground mt-12">
            © {new Date().getFullYear()} TipSplit. Made with ❤️.
        </footer>
      </main>
    </div>
  );
}
