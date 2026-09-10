import { z } from "zod";

export const startAuditSchema = z.object({
  supervisorId: z.string().uuid({ message: "Selecione quem está realizando a supervisão." }),
  locationId: z.string().uuid(),
});
export type StartAuditInput = z.infer<typeof startAuditSchema>;

export const itemResponseSchema = z
  .object({
    status: z.enum(["ok", "non_compliant"]).nullable(),
    justification: z.string().trim().max(1000).nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .refine(
    (data) =>
      data.status !== "non_compliant" ||
      (typeof data.justification === "string" && data.justification.trim().length > 0),
    {
      message: "Descreva o problema encontrado.",
      path: ["justification"],
    }
  );
export type ItemResponseInput = z.infer<typeof itemResponseSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email({ message: "Informe um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const auditFilterSchema = z.object({
  q: z.string().trim().optional(),
  supervisorId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: z.enum(["draft", "in_progress", "completed"]).optional(),
  onlyNonCompliant: z.coerce.boolean().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
});
export type AuditFilterInput = z.infer<typeof auditFilterSchema>;
