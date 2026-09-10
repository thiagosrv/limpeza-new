import { Badge } from "@/components/ui/badge";
import { PhotoGallery } from "@/components/admin/photo-gallery";
import type { AuditPhoto, AuditResponse } from "@/types/database";

export function DetailChecklistItem({
  name,
  response,
  photos,
  photoUrlByPath,
}: {
  name: string;
  response: AuditResponse | undefined;
  photos: AuditPhoto[];
  photoUrlByPath: Map<string, string>;
}) {
  const status = response?.status ?? null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{name}</p>
        {status === "ok" && <Badge tone="success">Conforme</Badge>}
        {status === "non_compliant" && <Badge tone="danger">Não conforme</Badge>}
        {status === null && <Badge tone="neutral">Pendente</Badge>}
      </div>

      {response?.justification && <p className="text-sm text-state-danger-600">{response.justification}</p>}
      {response?.notes && <p className="text-sm text-slate-500">{response.notes}</p>}

      {photos.length > 0 && (
        <PhotoGallery photos={photos.map((p) => ({ id: p.id, url: photoUrlByPath.get(p.storage_path) ?? null }))} />
      )}
    </div>
  );
}
