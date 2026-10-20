import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// A renovação de token do Supabase repete a chamada por até ~30s quando o
// serviço não responde, o que estoura o limite de 25s da Vercel (504). Aqui
// o middleware desiste antes e trata como "sem sessão".
const SUPABASE_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      }
    );
  });
}

/**
 * Renova a sessão Supabase nas rotas /admin e as protege (exceto
 * /admin/login) exigindo um usuário autenticado com role = 'admin'.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const userResult = await withTimeout(supabase.auth.getUser(), SUPABASE_TIMEOUT_MS);
  const user = userResult?.data.user ?? null;

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/admin/login");

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const profileResult = await withTimeout(
      supabase.from("profiles").select("role, active").eq("user_id", user.id).maybeSingle(),
      SUPABASE_TIMEOUT_MS
    );
    const profile = profileResult?.data ?? null;

    if (!profile || profile.role !== "admin" || !profile.active) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "acesso_negado");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginRoute && user) {
    const profileResult = await withTimeout(
      supabase.from("profiles").select("role, active").eq("user_id", user.id).maybeSingle(),
      SUPABASE_TIMEOUT_MS
    );
    const profile = profileResult?.data ?? null;

    if (profile?.role === "admin" && profile.active) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
