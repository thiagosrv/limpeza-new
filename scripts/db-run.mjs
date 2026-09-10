// Executa os arquivos .sql de supabase/migrations ou supabase/seed, em ordem,
// contra o Postgres apontado por DATABASE_URL. Uso:
//   npm run db:migrate
//   npm run db:seed
//   npm run db:setup
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// carrega .env sem dependência extra
try {
  const envPath = join(root, ".env");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  // .env é opcional (pode vir do ambiente do shell)
}

const target = process.argv[2];
if (target !== "migrations" && target !== "seed") {
  console.error('Uso: node scripts/db-run.mjs <migrations|seed>');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "DATABASE_URL não definida. Copie .env.example para .env e preencha a" +
      " connection string do Postgres (Supabase → Project Settings → Database)."
  );
  process.exit(1);
}

const { Client } = await import("pg");
const dir = join(root, "supabase", target);
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log(`Nenhum arquivo .sql encontrado em supabase/${target}.`);
  process.exit(0);
}

const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    console.log(`→ Executando ${target}/${file} ...`);
    await client.query(sql);
    console.log(`  OK`);
  }
  console.log(`\n${target === "migrations" ? "Migrations" : "Seed"} aplicado(a) com sucesso.`);
} catch (err) {
  console.error(`\nErro ao executar ${target}:`, err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
