// Gera os ícones do PWA a partir de um monograma SVG desenhado em código
// (sem depender de assets externos). Rodar com: npm run icons
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve(process.cwd(), "public", "icons");

const BLUE = "#0C1566";
const YELLOW = "#EDBC2B";
const WHITE = "#FFFFFF";

/**
 * Escudo estilizado com "check" — remete a proteção + conformidade.
 * `inset` controla a margem de segurança (maior para ícones maskable).
 */
function buildSvg({ size, inset }) {
  const s = size;
  const pad = s * inset;
  const c = s / 2;
  const shieldW = s - pad * 2;
  const top = pad;
  const shieldH = shieldW * 1.15;

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${s}" height="${s}" fill="${BLUE}"/>
  <path d="M ${c} ${top}
           L ${c + shieldW / 2} ${top + shieldH * 0.18}
           L ${c + shieldW / 2} ${top + shieldH * 0.55}
           C ${c + shieldW / 2} ${top + shieldH * 0.82}, ${c + shieldW * 0.2} ${top + shieldH * 0.98}, ${c} ${top + shieldH}
           C ${c - shieldW * 0.2} ${top + shieldH * 0.98}, ${c - shieldW / 2} ${top + shieldH * 0.82}, ${c - shieldW / 2} ${top + shieldH * 0.55}
           L ${c - shieldW / 2} ${top + shieldH * 0.18}
           Z"
        fill="${YELLOW}"/>
  <path d="M ${c - shieldW * 0.22} ${top + shieldH * 0.48}
           L ${c - shieldW * 0.04} ${top + shieldH * 0.66}
           L ${c + shieldW * 0.26} ${top + shieldH * 0.32}"
        fill="none" stroke="${BLUE}" stroke-width="${s * 0.045}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, inset: 0.08 },
  { name: "icon-512.png", size: 512, inset: 0.08 },
  { name: "icon-maskable-192.png", size: 192, inset: 0.18 },
  { name: "icon-maskable-512.png", size: 512, inset: 0.18 },
  { name: "apple-touch-icon.png", size: 180, inset: 0.12 },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const target of targets) {
    const svg = buildSvg(target);
    const outPath = path.join(OUT_DIR, target.name);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log(`✓ ${target.name}`);
  }

  // Favicon simples (32x32) para o <head>
  const faviconSvg = buildSvg({ size: 32, inset: 0.06 });
  await sharp(Buffer.from(faviconSvg)).png().toFile(path.resolve(process.cwd(), "public", "favicon.png"));
  console.log("✓ favicon.png");

  console.log(`\nÍcones gerados em public/icons (fundo ${BLUE}, destaque ${YELLOW}/${WHITE}).`);
}

main().catch((error) => {
  console.error("Falha ao gerar ícones:", error);
  process.exit(1);
});
