import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda somente no /admin, onde é preciso renovar a sessão e validar o
     * perfil. O fluxo de campo (supervisores) não usa sessão no servidor —
     * o login anônimo acontece no navegador — e não pode depender da
     * disponibilidade do Supabase só para abrir uma página.
     */
    "/admin/:path*",
  ],
};
