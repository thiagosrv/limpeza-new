import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-brand-blue-700" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
