import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AuditDraft, DraftPhoto, DraftSignature } from "@/lib/offline/types";

const DB_NAME = "ps-protecao-supervisao";
const DB_VERSION = 1;

interface AppDB extends DBSchema {
  drafts: {
    key: string;
    value: AuditDraft;
  };
  photos: {
    key: string;
    value: DraftPhoto & { auditId: string };
    indexes: { "by-audit": string };
  };
  signatures: {
    key: string;
    value: DraftSignature & { auditId: string };
  };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<AppDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB só está disponível no navegador."));
  }
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "auditId" });
        }
        if (!db.objectStoreNames.contains("photos")) {
          const photoStore = db.createObjectStore("photos", { keyPath: "id" });
          photoStore.createIndex("by-audit", "auditId");
        }
        if (!db.objectStoreNames.contains("signatures")) {
          db.createObjectStore("signatures", { keyPath: "auditId" });
        }
      },
    });
  }
  return dbPromise;
}
