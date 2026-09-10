// Tipos que espelham o schema definido em supabase/migrations/0001_init.sql.
// Mantidos manualmente por enquanto; se preferir, substitua por tipos gerados
// via `supabase gen types typescript` quando o projeto estiver conectado.

export type ProfileRole = "admin" | "supervisor";

// Nota: usar `type` (não `interface`) para as linhas das tabelas é obrigatório aqui —
// o resolvedor de tipos do @supabase/postgrest-js colapsa o resultado de `.select()`
// para `never` quando `Row` é uma `interface` em vez de um alias de tipo (objeto "fresco").
export type Profile = {
  id: string;
  user_id: string | null;
  name: string;
  role: ProfileRole;
  active: boolean;
  pin_code: string | null;
  created_at: string;
};

export type Location = {
  id: string;
  name: string;
  client_name: string;
  address: string | null;
  active: boolean;
  created_at: string;
};

export type AuditArea = {
  id: string;
  location_id: string;
  name: string;
  position: number;
  active: boolean;
  created_at: string;
};

export type AuditItem = {
  id: string;
  area_id: string;
  parent_item_id: string | null;
  name: string;
  position: number;
  active: boolean;
  created_at: string;
};

export type AuditStatus = "draft" | "in_progress" | "completed";

export type Audit = {
  id: string;
  audit_number: string;
  location_id: string;
  supervisor_id: string;
  created_by: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  status: AuditStatus;
  total_items: number;
  ok_items: number;
  non_compliant_items: number;
  conformity_percentage: number | null;
  created_at: string;
  updated_at: string;
};

export type ResponseStatus = "ok" | "non_compliant";

export type AuditResponse = {
  id: string;
  audit_id: string;
  audit_item_id: string;
  status: ResponseStatus | null;
  justification: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditPhoto = {
  id: string;
  audit_id: string;
  audit_response_id: string;
  storage_path: string;
  original_filename: string | null;
  created_at: string;
};

export type AuditSignature = {
  id: string;
  audit_id: string;
  supervisor_name: string;
  storage_path: string;
  signed_at: string;
};

export type AuditEvent = {
  id: string;
  audit_id: string | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

// ── Tipos compostos usados na UI ───────────────────────────────────────────

/** Item de checklist já combinado com sua resposta e fotos, para renderização. */
export interface ChecklistItemView extends AuditItem {
  response: AuditResponse | null;
  photos: AuditPhoto[];
  children: ChecklistItemView[];
}

export interface ChecklistAreaView extends AuditArea {
  items: ChecklistItemView[];
  leafTotal: number;
  leafAnswered: number;
}

// `Relationships` vazio é exigido estruturalmente por `GenericTable` (@supabase/postgrest-js)
// para que o client infira corretamente Row/Insert/Update em vez de colapsar para `never`.
type NoRelationships = { Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> } & NoRelationships;
      locations: { Row: Location; Insert: Partial<Location>; Update: Partial<Location> } & NoRelationships;
      audit_areas: { Row: AuditArea; Insert: Partial<AuditArea>; Update: Partial<AuditArea> } & NoRelationships;
      audit_items: { Row: AuditItem; Insert: Partial<AuditItem>; Update: Partial<AuditItem> } & NoRelationships;
      audits: { Row: Audit; Insert: Partial<Audit>; Update: Partial<Audit> } & NoRelationships;
      audit_responses: {
        Row: AuditResponse;
        Insert: Partial<AuditResponse>;
        Update: Partial<AuditResponse>;
      } & NoRelationships;
      audit_photos: {
        Row: AuditPhoto;
        Insert: Partial<AuditPhoto>;
        Update: Partial<AuditPhoto>;
      } & NoRelationships;
      audit_signatures: {
        Row: AuditSignature;
        Insert: Partial<AuditSignature>;
        Update: Partial<AuditSignature>;
      } & NoRelationships;
      audit_events: {
        Row: AuditEvent;
        Insert: Partial<AuditEvent>;
        Update: Partial<AuditEvent>;
      } & NoRelationships;
    };
    // Exigidos estruturalmente por `GenericSchema` (@supabase/postgrest-js), mesmo sem uso.
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
