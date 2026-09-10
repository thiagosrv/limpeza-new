import { AccordionItem } from "@/components/ui/accordion";
import { ProgressRing } from "@/components/ui/progress";
import { ChecklistItem } from "@/components/audit/checklist-item";
import type { ChecklistAreaFixture, ChecklistItemFixture } from "@/lib/constants/checklist";
import type { AuditDraft, DraftPhoto, ItemStatus } from "@/lib/offline/types";

function flattenLeaves(items: ChecklistItemFixture[]): ChecklistItemFixture[] {
  return items.flatMap((item) => (item.children && item.children.length > 0 ? item.children : [item]));
}

export function AreaAccordion({
  area,
  draft,
  photosByItem,
  onStatusChange,
  onJustificationChange,
  onNotesChange,
  onAddPhoto,
  onRemovePhoto,
}: {
  area: ChecklistAreaFixture;
  draft: AuditDraft | null;
  photosByItem: Record<string, DraftPhoto[]>;
  onStatusChange: (itemId: string, status: ItemStatus) => void;
  onJustificationChange: (itemId: string, value: string) => void;
  onNotesChange: (itemId: string, value: string) => void;
  onAddPhoto: (itemId: string, blob: Blob, mimeType: string) => Promise<void> | void;
  onRemovePhoto: (itemId: string, photoId: string) => Promise<void> | void;
}) {
  const leaves = flattenLeaves(area.items);
  const answered = leaves.filter((leaf) => draft?.responses[leaf.id]?.status).length;
  const nonCompliant = leaves.filter((leaf) => draft?.responses[leaf.id]?.status === "non_compliant").length;

  return (
    <AccordionItem
      id={area.id}
      title={area.name}
      subtitle={`${answered} de ${leaves.length} itens`}
      badge={
        nonCompliant > 0 ? (
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-state-danger-50 text-[11px] font-bold text-state-danger-600">
            {nonCompliant}
          </span>
        ) : undefined
      }
    >
      <div className="flex items-center justify-end">
        <ProgressRing value={answered} max={leaves.length} size={36} strokeWidth={3.5} label={`${answered}/${leaves.length}`} />
      </div>

      {area.items.map((item) =>
        item.children && item.children.length > 0 ? (
          <div key={item.id} className="flex flex-col gap-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.name}</p>
            {item.children.map((child) => (
              <ChecklistItem
                key={child.id}
                itemId={child.id}
                name={child.name}
                response={draft?.responses[child.id]}
                photos={photosByItem[child.id] ?? []}
                onStatusChange={(status) => onStatusChange(child.id, status)}
                onJustificationChange={(value) => onJustificationChange(child.id, value)}
                onNotesChange={(value) => onNotesChange(child.id, value)}
                onAddPhoto={(blob, mimeType) => onAddPhoto(child.id, blob, mimeType)}
                onRemovePhoto={(photoId) => onRemovePhoto(child.id, photoId)}
              />
            ))}
          </div>
        ) : (
          <ChecklistItem
            key={item.id}
            itemId={item.id}
            name={item.name}
            response={draft?.responses[item.id]}
            photos={photosByItem[item.id] ?? []}
            onStatusChange={(status) => onStatusChange(item.id, status)}
            onJustificationChange={(value) => onJustificationChange(item.id, value)}
            onNotesChange={(value) => onNotesChange(item.id, value)}
            onAddPhoto={(blob, mimeType) => onAddPhoto(item.id, blob, mimeType)}
            onRemovePhoto={(photoId) => onRemovePhoto(item.id, photoId)}
          />
        )
      )}
    </AccordionItem>
  );
}
