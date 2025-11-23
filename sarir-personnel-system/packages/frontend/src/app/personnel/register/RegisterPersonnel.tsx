"use client";

import { FormPageLayout } from "@/components/layouts/FormPageLayout";
import { PersonForm } from "@/components/personnel/PersonForm";

export default function RegisterPersonnelPage() {
  return (
    <FormPageLayout
      title="ثبت پرسنل جدید"
      description="اطلاعات هویتی و سازمانی پرسنل را تکمیل کنید."
      widthClassName="max-w-4xl"
    >
      <PersonForm />
    </FormPageLayout>
  );
}
