import type { Metadata } from "next";
import { StartAuditForm } from "@/components/audit/start-audit-form";

export const metadata: Metadata = {
  title: "Início",
};

export default function FieldHomePage() {
  return <StartAuditForm />;
}
