"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowDownCircle, ArrowUpCircle, CircleSlash } from "lucide-react";

interface RoundingOptionsProps {
  rounding: "none" | "up" | "down";
  setRounding: (value: "none" | "up" | "down") => void;
}

export function RoundingOptions({ rounding, setRounding }: RoundingOptionsProps) {
  return (
    <div>
      <Label className="text-lg mb-2 block">Rounding Options (Per Person)</Label>
      <RadioGroup
        value={rounding}
        onValueChange={setRounding}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { value: "none", label: "No Rounding", Icon: CircleSlash },
          { value: "up", label: "Round Up", Icon: ArrowUpCircle },
          { value: "down", label: "Round Down", Icon: ArrowDownCircle },
        ].map(({ value, label, Icon }) => (
          <Label
            key={value}
            htmlFor={`rounding-${value}`}
            className={`flex flex-col items-center justify-center space-y-2 rounded-md border-2 p-4 hover:border-primary cursor-pointer transition-all
              ${rounding === value ? "border-primary bg-primary/10" : "border-muted"}`}
          >
            <RadioGroupItem value={value} id={`rounding-${value}`} className="sr-only" />
            <Icon className={`h-8 w-8 mb-1 ${rounding === value ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${rounding === value ? "text-primary" : "text-foreground"}`}>{label}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
