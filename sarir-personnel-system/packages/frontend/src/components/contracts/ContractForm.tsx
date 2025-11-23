import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ContractFormValues = {
  title: string;
  party: string;
  date: string;
  amount: string;
};

type ContractFormProps = {
  values: ContractFormValues;
  onChange: (values: ContractFormValues) => void;
  onSubmit: (values: ContractFormValues) => void;
  submitLabel: string;
  cancelLabel?: string;
  onCancel?: () => void;
};

export function ContractForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  cancelLabel = "انصراف",
  onCancel,
}: ContractFormProps) {
  const updateField =
    (field: keyof ContractFormValues) => (value: string) =>
      onChange({ ...values, [field]: value });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان قرارداد</Label>
        <Input
          id="title"
          placeholder="مثال: قرارداد خرید تجهیزات"
          value={values.title}
          onChange={(e) => updateField("title")(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="party">طرف قرارداد</Label>
        <Input
          id="party"
          placeholder="مثال: شرکت آتیه"
          value={values.party}
          onChange={(e) => updateField("party")(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">تاریخ</Label>
          <Input
            id="date"
            type="date"
            value={values.date}
            onChange={(e) => updateField("date")(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">مبلغ (ریال)</Label>
          <Input
            id="amount"
            type="number"
            inputMode="numeric"
            placeholder="مثال: 120000000"
            value={values.amount}
            onChange={(e) => updateField("amount")(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
