import { OfflineBanner } from "@/components/shared/offline-banner";

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-slate-50">
      <OfflineBanner />
      {children}
    </div>
  );
}
