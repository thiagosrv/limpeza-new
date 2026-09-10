"use client";

import { createClient } from "@/lib/supabase/client";

let ensurePromise: Promise<string | null> | null = null;

/**
 * Garante uma sessão do Supabase Auth no dispositivo do supervisor de campo.
 * Sem isso as políticas de RLS (que exigem `authenticated`) bloqueiam tudo.
 * Se já existir uma sessão (anônima ou de admin), reaproveita. Retorna o
 * user id, ou null se não foi possível abrir sessão (ex.: offline / Supabase
 * ainda não configurado) — nesse caso o app continua funcionando localmente
 * e sincroniza quando a conexão voltar.
 */
export function ensureAnonymousSession(): Promise<string | null> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const supabase = createClient();
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) return data.session.user.id;

        const { data: signInData, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        return signInData.user?.id ?? null;
      } catch (error) {
        console.error("Falha ao autenticar sessão anônima no Supabase:", error);
        ensurePromise = null;
        return null;
      }
    })();
  }
  return ensurePromise;
}
