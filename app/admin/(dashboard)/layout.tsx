import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || !profile.active) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-slate-50">
      <AdminSidebar adminName={profile.name} />
      <main className="pt-14 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
