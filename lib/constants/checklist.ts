/**
 * Fixture local do checklist Hanier — espelha exatamente supabase/seed/seed.sql
 * (mesmos UUIDs). Serve como fallback offline-first: o app tenta buscar a
 * estrutura real do Supabase e cacheia no IndexedDB; se não houver conexão
 * nem cache local (primeiro uso, ou banco ainda não configurado), a
 * checklist funciona igual usando estes dados fixos. Se editar aqui, edite
 * o seed.sql junto para manter os ids sincronizados.
 */

export const HANIER_LOCATION_ID = "10000000-0000-4000-8000-000000000001";

export const HANIER_LOCATION = {
  id: HANIER_LOCATION_ID,
  name: "Hanier Indústria Química",
  clientName: "Hanier Indústria Química",
};

export interface SupervisorFixture {
  id: string;
  name: string;
}

export const SUPERVISORS: SupervisorFixture[] = [
  { id: "20000000-0000-4000-8000-000000000001", name: "Álvaro" },
  { id: "20000000-0000-4000-8000-000000000002", name: "Thiago" },
  { id: "20000000-0000-4000-8000-000000000003", name: "Hermes" },
  { id: "20000000-0000-4000-8000-000000000004", name: "Alexandre" },
  { id: "20000000-0000-4000-8000-000000000005", name: "Gabriela" },
  { id: "20000000-0000-4000-8000-000000000006", name: "Amanda" },
  { id: "20000000-0000-4000-8000-000000000007", name: "Divanilson" },
];

export interface ChecklistItemFixture {
  id: string;
  name: string;
  position: number;
  children?: ChecklistItemFixture[];
}

export interface ChecklistAreaFixture {
  id: string;
  name: string;
  position: number;
  items: ChecklistItemFixture[];
}

export const CHECKLIST_AREAS: ChecklistAreaFixture[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    name: "Áreas de Apoio",
    position: 1,
    items: [
      { id: "41010000-0000-4000-8000-010100000000", name: "Lavanderia", position: 1 },
      { id: "41020000-0000-4000-8000-010200000000", name: "Área de Lixo e Descartes", position: 2 },
      { id: "41030000-0000-4000-8000-010300000000", name: "Sala de Descanso", position: 3 },
      { id: "41040000-0000-4000-8000-010400000000", name: "Sala de TV", position: 4 },
      { id: "41050000-0000-4000-8000-010500000000", name: "Sala de Jogos", position: 5 },
      { id: "41060000-0000-4000-8000-010600000000", name: "Depósito de Insumos", position: 6 },
      { id: "41070000-0000-4000-8000-010700000000", name: "Refeitório", position: 7 },
      { id: "41080000-0000-4000-8000-010800000000", name: "Banheiros Masculino / Feminino — Refeitório", position: 8 },
      { id: "41090000-0000-4000-8000-010900000000", name: "Cozinha e Dependências", position: 9 },
    ],
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    name: "Manutenção",
    position: 2,
    items: [
      { id: "42010000-0000-4000-8000-020100000000", name: "Área de Manutenção", position: 1 },
      { id: "42020000-0000-4000-8000-020200000000", name: "Banheiro Manutenção", position: 2 },
      { id: "42030000-0000-4000-8000-020300000000", name: "Almoxarifado e Dependências", position: 3 },
      { id: "42040000-0000-4000-8000-020400000000", name: "Pátio Manutenção", position: 4 },
      { id: "42050000-0000-4000-8000-020500000000", name: "Banheiro Deficiente", position: 5 },
      { id: "42060000-0000-4000-8000-020600000000", name: "Sala de Jardinagem", position: 6 },
      { id: "42070000-0000-4000-8000-020700000000", name: "Sala de Triagem e Enfermagem", position: 7 },
    ],
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    name: "Prédio 1 / Indústria",
    position: 3,
    items: [
      { id: "43010000-0000-4000-8000-030100000000", name: "Vestiário Masculino / Feminino", position: 1 },
      { id: "43020000-0000-4000-8000-030200000000", name: "Sala de Café", position: 2 },
      { id: "43030000-0000-4000-8000-030300000000", name: "Escada", position: 3 },
      { id: "43040000-0000-4000-8000-030400000000", name: "Laboratório LAD", position: 4 },
      { id: "43050000-0000-4000-8000-030500000000", name: "Sala Superior — Depósito", position: 5 },
    ],
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    name: "Administrativo",
    position: 4,
    items: [
      { id: "44010000-0000-4000-8000-040100000000", name: "Recepção", position: 1 },
      { id: "44020000-0000-4000-8000-040200000000", name: "Escadas", position: 2 },
      { id: "44030000-0000-4000-8000-040300000000", name: "Auditório", position: 3 },
      { id: "44040000-0000-4000-8000-040400000000", name: "Banheiro Masculino / Feminino", position: 4 },
      {
        id: "44050000-0000-4000-8000-040500000000",
        name: "Sala Administrativo",
        position: 5,
        children: [
          { id: "44060000-0000-4000-8000-040600000000", name: "Carpete", position: 1 },
          { id: "44070000-0000-4000-8000-040700000000", name: "Ventiladores", position: 2 },
          { id: "44080000-0000-4000-8000-040800000000", name: "Lixos e Mesas", position: 3 },
          { id: "44090000-0000-4000-8000-040900000000", name: "Organização Impressoras + Café", position: 4 },
        ],
      },
    ],
  },
  {
    id: "30000000-0000-4000-8000-000000000005",
    name: "Portaria",
    position: 5,
    items: [
      { id: "45010000-0000-4000-8000-050100000000", name: "Banheiro Portaria", position: 1 },
      { id: "45020000-0000-4000-8000-050200000000", name: "Balcão e Organização", position: 2 },
      { id: "45030000-0000-4000-8000-050300000000", name: "Banheiro 2 Portaria", position: 3 },
      { id: "45040000-0000-4000-8000-050400000000", name: "Piso Superior", position: 4 },
    ],
  },
];

/** Soma apenas itens-folha (subcategorias contam, o grupo-pai não). */
export function countLeafItems(areas: ChecklistAreaFixture[] = CHECKLIST_AREAS): number {
  let total = 0;
  for (const area of areas) {
    for (const item of area.items) {
      total += item.children && item.children.length > 0 ? item.children.length : 1;
    }
  }
  return total;
}
