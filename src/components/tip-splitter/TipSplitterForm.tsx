"use client";

import type { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { TipSplitterFormValues } from "@/lib/types";
import { DollarSign, Users, Percent, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TipSplitterFormProps {
  control: Control<TipSplitterFormValues>;
  selectedTipTab: string;
  setSelectedTipTab: (value: string) => void;
  customTipPercentage: string;
  setCustomTipPercentage: (value: string) => void;
  effectiveTipPercentage: number;
  setNumberOfPeople: (updater: (prev: number) => number) => void;
  numberOfPeople: number;
}

const PRESET_TIPS = [15, 18, 20, 25];
const CURRENCY_SYMBOL = "$";

export function TipSplitterForm({
  control,
  selectedTipTab,
  setSelectedTipTab,
  customTipPercentage,
  setCustomTipPercentage,
  effectiveTipPercentage,
  setNumberOfPeople,
  numberOfPeople,
}: TipSplitterFormProps) {

  const handlePeopleChange = (amount: number) => {
    setNumberOfPeople(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="billAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="billAmount" className="text-lg">Bill Amount</FormLabel>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <FormControl>
                <Input
                  id="billAmount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10 text-base"
                  {...field}
                  aria-describedby="billAmount-message"
                />
              </FormControl>
            </div>
            <FormMessage id="billAmount-message" />
          </FormItem>
        )}
      />

      <div>
        <Label htmlFor="tipPercentage" className="text-lg">Select Tip %</Label>
        <Tabs
          value={selectedTipTab}
          onValueChange={setSelectedTipTab}
          className="mt-1 w-full"
          id="tipPercentage"
        >
          <TabsList className="grid w-full grid-cols-5">
            {PRESET_TIPS.map((tip) => (
              <TabsTrigger key={tip} value={String(tip)} className="text-base">
                {tip}%
              </TabsTrigger>
            ))}
            <TabsTrigger value="custom" className="text-base">Custom</TabsTrigger>
          </TabsList>
          <TabsContent value="custom" className="mt-4">
            <div className="relative">
               <FormControl>
                <Input
                  type="number"
                  placeholder="Enter custom tip %"
                  value={customTipPercentage}
                  onChange={(e) => setCustomTipPercentage(e.target.value)}
                  className="pr-10 text-base"
                  aria-label="Custom tip percentage"
                />
              </FormControl>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Percent className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            {Number.isNaN(parseFloat(customTipPercentage)) && customTipPercentage !== '' && selectedTipTab === 'custom' && (
                <p className="text-sm font-medium text-destructive mt-1">Please enter a valid number.</p>
            )}
          </TabsContent>
        </Tabs>
        <p className="text-sm text-muted-foreground mt-2">Effective tip: {effectiveTipPercentage.toFixed(1)}%</p>
      </div>

      <FormField
        control={control}
        name="numberOfPeople"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="numberOfPeople" className="text-lg">Number of People</FormLabel>
            <div className="relative mt-1 flex items-center space-x-2">
              <Button type="button" variant="outline" size="icon" onClick={() => handlePeopleChange(-1)} disabled={numberOfPeople <= 1} aria-label="Decrease number of people">
                <Minus className="h-5 w-5" />
              </Button>
              <FormControl>
                <Input
                  id="numberOfPeople"
                  type="number"
                  placeholder="1"
                  className="text-center text-base w-20"
                  {...field}
                  value={numberOfPeople}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >=1) {
                      setNumberOfPeople(() => val);
                      field.onChange(String(val)); // Update RHF field
                    } else if (e.target.value === '') {
                       setNumberOfPeople(() => 1); // Or some placeholder state
                       field.onChange('');
                    }
                  }}
                  aria-describedby="numberOfPeople-message"
                />
              </FormControl>
               <Button type="button" variant="outline" size="icon" onClick={() => handlePeopleChange(1)} aria-label="Increase number of people">
                <Plus className="h-5 w-5" />
              </Button>
              <div className="pointer-events-none absolute inset-y-0 left-36 flex items-center pl-3 sm:left-32"> 
                 {/* Adjusted left for Users icon based on Input width and buttons, may need fine-tuning */}
              </div>
            </div>
             <FormMessage id="numberOfPeople-message" />
          </FormItem>
        )}
      />
    </div>
  );
}
