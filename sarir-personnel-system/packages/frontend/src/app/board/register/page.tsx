"use client";

import Link from "next/link";

import BoardForm from "@/components/board/BoardForm";
import { FormPageLayout } from "@/components/layouts/FormPageLayout";
import { Button } from "@/components/ui/button";

export default function RegisterBoardMember() {
  return (
    <div dir="rtl">
      <FormPageLayout
        title="ثبت/مدیریت هیئت مدیره"
        description="اطلاعات اعضای هیئت مدیره و جلسات را ثبت و خروجی PDF/ICS تهیه کنید."
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/board/list">بازگشت به لیست</Link>
          </Button>
        }
        widthClassName="max-w-6xl"
      >
        <BoardForm />
      </FormPageLayout>
    </div>
  );
}
