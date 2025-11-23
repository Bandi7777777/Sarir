// RegisterDriver.tsx
"use client";

import RegisterDriverImpl from "./_RegisterDriverImpl";

import { FormPageLayout } from "@/components/layouts/FormPageLayout";

export default function RegisterDriverPage() {
  return (
    <FormPageLayout
      title="ثبت راننده جدید"
      description="مشخصات راننده و اطلاعات تماس را وارد کنید."
      widthClassName="max-w-4xl"
    >
      <RegisterDriverImpl />
    </FormPageLayout>
  );
}
