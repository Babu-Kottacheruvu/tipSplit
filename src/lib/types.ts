export interface PastSpendingItem {
  id: string; // Add an ID for list rendering and deletion
  billAmount: number;
  tipPercentage: number;
  numberOfPeople: number;
}

export interface BillDetails {
  billAmount: number;
  tipPercentage: number;
  numberOfPeople: number;
}

// For react-hook-form
export interface TipSplitterFormValues {
  billAmount: string;
  numberOfPeople: string;
}

export interface PastBillEntryFormValues {
  pastBillAmount: string;
  pastTipPercentage: string;
  pastNumberOfPeople: string;
}
