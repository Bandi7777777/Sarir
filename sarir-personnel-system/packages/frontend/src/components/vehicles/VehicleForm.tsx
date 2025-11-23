import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type VehicleFormValues = {
  model: string;
  plate: string;
  chassisNumber: string;
  driverId: string;
  status: "active" | "maintenance" | "inactive";
  latitude: string;
  longitude: string;
};

type VehicleFormProps = {
  values: VehicleFormValues;
  onChange: (values: VehicleFormValues) => void;
  onSubmit: (values: VehicleFormValues) => void;
  submitLabel: string;
  onCancel?: () => void;
};

export function VehicleForm({ values, onChange, onSubmit, submitLabel, onCancel }: VehicleFormProps) {
  const updateField =
    (field: keyof VehicleFormValues) => (value: string) =>
      onChange({ ...values, [field]: value });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="model">مدل وسیله</Label>
        <Input
          id="model"
          placeholder="مثال: کامیون FH"
          value={values.model}
          onChange={(e) => updateField("model")(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plate">پلاک</Label>
        <Input
          id="plate"
          placeholder="مثال: 12الف345"
          value={values.plate}
          onChange={(e) => updateField("plate")(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="chassis">شماره شاسی</Label>
        <Input
          id="chassis"
          placeholder="شماره شاسی"
          value={values.chassisNumber}
          onChange={(e) => updateField("chassisNumber")(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="driver">شناسه راننده</Label>
          <Input
            id="driver"
            type="number"
            inputMode="numeric"
            placeholder="مثال: 1021"
            value={values.driverId}
            onChange={(e) => updateField("driverId")(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">وضعیت</Label>
          <Select value={values.status} onValueChange={(v) => updateField("status")(v)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="انتخاب وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="maintenance">در تعمیر</SelectItem>
              <SelectItem value="inactive">غیرفعال</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lat">عرض جغرافیایی</Label>
          <Input
            id="lat"
            type="number"
            step="0.000001"
            placeholder="مثال: 35.6892"
            value={values.latitude}
            onChange={(e) => updateField("latitude")(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">طول جغرافیایی</Label>
          <Input
            id="lng"
            type="number"
            step="0.000001"
            placeholder="مثال: 51.3890"
            value={values.longitude}
            onChange={(e) => updateField("longitude")(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        ) : null}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
