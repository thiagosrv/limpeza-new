"use server";

import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validation/schemas";

export interface AdminLoginResult {
  success: boolean;
  message?: string;
  redirectTo?: string;
}

function safeRedirect(redirectTo: string | undefined): string {
  if (redirectTo && redirectTo.startsWith("/admin") && !redirectTo.startsWith("/admin/login")) {
    return redirectTo;
  }
  return "/admin";
}

export async function loginAdmin(input: AdminLoginInput, redirectTo?: string): Promise<AdminLoginResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Informe um e-mail e senha válidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { success: false, message: "E-mail ou senha incorretos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || !profile.active) {
    await supabase.auth.signOut();
    return { success: false, message: "Este usuário não tem acesso ao painel administrativo." };
  }

  return { success: true, redirectTo: safeRedirect(redirectTo) };
}
