"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validation/schemas";
import { loginAdmin } from "@/app/admin/login/actions";

const URL_ERROR_MESSAGES: Record<string, string> = {
  acesso_negado: "Este usuário não tem acesso ao painel administrativo.",
};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const urlError = searchParams.get("error");

  const [formError, setFormError] = useState<string | null>(
    urlError ? (URL_ERROR_MESSAGES[urlError] ?? null) : null
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  async function onSubmit(values: AdminLoginInput) {
    setSubmitting(true);
    setFormError(null);
    try {
      const result = await loginAdmin(values, redirectTo);
      if (result.success) {
        router.replace(result.redirectTo ?? "/admin");
        router.refresh();
        return;
      }
      setFormError(result.message ?? "Não foi possível entrar. Tente novamente.");
    } catch {
      setFormError("Não foi possível entrar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-blue-700 px-6 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-white text-brand-blue-700 shadow-float">
            <ShieldCheck className="size-8" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">PS Proteção</h1>
            <p className="mt-0.5 text-sm font-semibold text-brand-blue-200">Painel Administrativo</p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField label="E-mail" htmlFor="email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </FormField>

            <FormField label="Senha" htmlFor="password" error={errors.password?.message} required>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                invalid={Boolean(errors.password)}
                {...register("password")}
              />
            </FormField>

            {formError && (
              <p className="rounded-lg bg-state-danger-50 px-3.5 py-2.5 text-sm font-medium text-state-danger-600" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
              <LogIn className="size-5" />
              ENTRAR
            </Button>
          </form>
        </Card>

        <p className="px-4 text-center text-[11px] leading-relaxed text-brand-blue-200">
          App desenvolvido para HANIER Ind. Química por PS PROTEÇÃO
        </p>
      </div>
    </div>
  );
}
