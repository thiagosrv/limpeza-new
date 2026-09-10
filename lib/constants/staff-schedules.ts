/**
 * Fixture local das escalas semanais da equipe de limpeza — origem:
 * planilha "DESCRIÇÕES DE FUNÇÕES - LIMPEZA.xlsx" fornecida pelo cliente.
 * Usada pelo botão flutuante "LIVE" para mostrar, em tempo real, onde cada
 * colaboradora está atuando. Dado estático (sem tabela no banco): a escala
 * muda raramente e o app já segue o padrão de fixtures locais (ver
 * lib/constants/checklist.ts).
 */

export type Weekday = "segunda" | "terca" | "quarta" | "quinta" | "sexta";

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
};

export interface ScheduleBlock {
  /** Minutos desde 00:00 */
  start: number;
  /** Minutos desde 00:00 */
  end: number;
  description: string;
}

export interface ScheduleGroup {
  days: Weekday[];
  blocks: ScheduleBlock[];
}

export interface StaffSchedule {
  id: string;
  name: string;
  groups: ScheduleGroup[];
  notes?: string[];
}

function t(hhmm: string): number {
  const [h, m] = hhmm.trim().split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function blocks(pairs: [string, string, string][]): ScheduleBlock[] {
  return pairs.map(([start, end, description]) => ({ start: t(start), end: t(end), description }));
}

const ALL_DAYS: Weekday[] = ["segunda", "terca", "quarta", "quinta", "sexta"];

export const STAFF_SCHEDULES: StaffSchedule[] = [
  {
    id: "ana-cristina",
    name: "Ana Cristina",
    groups: [
      {
        days: ["segunda", "quarta", "sexta"],
        blocks: blocks([
          ["07:00", "07:15", "Café da manhã"],
          ["07:20", "07:35", "Retirar lixos de todos os banheiros (Adm. piso superior e térreo)"],
          ["07:35", "07:50", "Ginástica laboral"],
          ["07:50", "09:10", "Limpeza dos banheiros — Adm. piso superior (masculino e feminino)"],
          ["09:15", "11:00", "Limpeza dos banheiros — Adm. térreo (masculino, feminino e deficiente)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "13:30", "Limpeza da sala e banheiro do Marcos (Prédio 1)"],
          ["13:30", "15:00", "Limpeza dos banheiros — Prédio 2 (masculino e feminino)"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:48", "Limpeza do banheiro da sala de atendimento e banheiro deficiente"],
        ]),
      },
      {
        days: ["terca"],
        blocks: blocks([
          ["07:00", "07:15", "Café da manhã"],
          [
            "07:20",
            "08:00",
            "Retirar lixos de todos os banheiros (Adm. piso superior e térreo) e adiantar limpeza dos banheiros do piso superior",
          ],
          ["08:00", "10:00", "Varrer o pátio (em equipe)"],
          ["10:00", "11:00", "Manutenção dos banheiros — Adm. térreo (masculino, feminino e deficiente)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "13:30", "Limpeza da sala e banheiro do Marcos (Prédio 1)"],
          ["13:30", "15:00", "Limpeza dos banheiros — Prédio 2 (masculino e feminino)"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:48", "Limpeza do banheiro da sala de atendimento e banheiro deficiente"],
        ]),
      },
      {
        days: ["quinta"],
        blocks: blocks([
          ["07:00", "07:15", "Café da manhã"],
          ["07:20", "09:20", "Limpeza pesada dos banheiros — Adm. piso superior"],
          ["09:20", "11:00", "Limpeza pesada dos banheiros — Adm. térreo"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "13:30", "Limpeza da sala e banheiro do Marcos (Prédio 1)"],
          ["13:30", "15:00", "Limpeza pesada dos banheiros — Prédio 2 (masculino e feminino)"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:48", "Limpeza pesada dos banheiros — sala de atendimento e banheiro deficiente"],
        ]),
      },
    ],
    notes: ["Limpeza dos ventiladores dos banheiros: 1 vez por mês"],
  },
  {
    id: "angelica",
    name: "Angélica",
    groups: [
      {
        days: ["segunda"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 1)"],
          ["07:35", "07:50", "Ginástica laboral"],
          ["07:50", "08:05", "Café da manhã"],
          ["08:05", "09:40", "Lavar área de lazer (acompanhando Rose)"],
          ["09:40", "10:10", "Limpeza dos banheiros da portaria, balcão, varrer e passar pano"],
          ["10:10", "10:50", "Limpeza do banheiro masculino (Prédio 1)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "13:00", "Limpeza do banheiro feminino (Prédio 1), LCQ e escada"],
          ["13:00", "14:00", "Lavar banheiro da manutenção, limpeza da ETE e manutenção"],
          ["14:00", "15:00", "Limpeza dos banheiros (feminino, masculino e banheiro interno do restaurante)"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:48", "Apoio fixo — Rose"],
        ]),
      },
      {
        days: ["terca"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 1)"],
          ["07:30", "07:45", "Café da manhã"],
          ["07:45", "08:00", "Retirar lixos das áreas sob responsabilidade"],
          ["08:00", "09:40", "Varrer o pátio (em equipe)"],
          ["09:40", "10:10", "Limpeza dos banheiros da portaria, balcão, varrer e passar pano"],
          ["10:10", "10:50", "Limpeza do banheiro masculino (Prédio 1)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "13:00", "Limpeza do banheiro feminino (Prédio 1), LCQ e escada"],
          ["13:00", "14:00", "Lavar banheiro da manutenção, ETE e manutenção"],
          ["14:00", "15:00", "Limpeza dos banheiros (feminino, masculino e banheiro interno do restaurante)"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:48", "Apoio fixo — Rose"],
        ]),
      },
      {
        days: ["quinta"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 1)"],
          ["07:30", "07:45", "Café da manhã"],
          ["07:45", "08:45", "Limpeza pesada dos banheiros da portaria"],
          [
            "08:45",
            "10:10",
            "Limpeza pesada das áreas da portaria (mezanino, paredes, escada, balcão, vidros, varrer e passar pano)",
          ],
          ["10:10", "10:50", "Limpeza pesada do banheiro masculino (Prédio 1)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "14:00", "Limpeza pesada do banheiro feminino (Prédio 1), LCQ e escada"],
          ["14:00", "15:00", "Lavar banheiro da manutenção, ETE e manutenção"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:48", "Limpeza pesada dos banheiros (feminino, masculino e banheiro interno do restaurante)"],
        ]),
      },
      {
        days: ["quarta", "sexta"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 1)"],
          ["07:35", "07:50", "Ginástica laboral"],
          ["07:50", "08:05", "Café da manhã"],
          ["08:05", "09:05", "Limpeza dos banheiros da portaria"],
          ["09:05", "09:35", "Limpeza do piso superior (mezanino e escada)"],
          ["09:35", "10:10", "Limpeza da portaria (balcão, vidros, varrer e passar pano)"],
          ["10:10", "10:50", "Limpeza do banheiro masculino (Prédio 1)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "13:00", "Limpeza do banheiro feminino (Prédio 1), LCQ e escada"],
          ["13:00", "14:00", "Lavar banheiro da manutenção, ETE e manutenção"],
          ["14:00", "15:00", "Limpeza dos banheiros (feminino, masculino e banheiro interno do restaurante)"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:48", "Apoio fixo — Rose"],
        ]),
      },
    ],
    notes: [
      "Segunda-feira: não realizar a limpeza da parte superior (mezanino) da portaria",
      "A cada 15 dias: lavagem da manutenção, com a Rose",
    ],
  },
  {
    id: "cilene",
    name: "Cilene",
    groups: [
      {
        days: ["segunda", "quarta", "quinta", "sexta"],
        blocks: blocks([
          ["07:00", "07:35", "Preparar cafés do administrativo e portaria"],
          ["07:35", "07:50", "Ginástica laboral"],
          ["07:50", "08:00", "Recolher lixos das salas da diretoria, reunião e TI"],
          ["08:00", "09:00", "Limpar máquinas de café, repor quando necessário e abastecer descartáveis"],
          ["09:00", "09:15", "Café da manhã"],
          ["09:15", "12:00", "Limpeza da copa, corredor do piso superior, escada da recepção, e preparar cafés da tarde"],
          ["12:00", "13:00", "Almoço"],
          ["13:00", "14:00", "Limpeza e reposição de todas as máquinas de café"],
          ["14:00", "14:30", "Recolher e levar todos os panos (chão, limpeza e pano de prato) para a lavanderia"],
          [
            "14:30",
            "16:00",
            "Limpeza das salas de TI, reunião, diretoria (Edson, Hélio e Joel, quando autorizado) e atendimento",
          ],
          [
            "16:00",
            "16:48",
            "Recolher garrafas vazias de café, fechar janelas dos banheiros e separar no DML os produtos de limpeza do dia seguinte",
          ],
        ]),
      },
      {
        days: ["terca"],
        blocks: blocks([
          ["07:00", "07:35", "Preparar cafés do administrativo e da portaria"],
          [
            "07:35",
            "08:00",
            "Recolher lixos das salas da diretoria, reunião e TI e limpar as máquinas de café (TI e sala de reunião)",
          ],
          ["08:00", "10:00", "Varrer o pátio (em equipe)"],
          ["10:00", "10:20", "Limpeza da máquina de café da recepção"],
          ["10:20", "12:00", "Limpeza da copa, corredor do piso superior, escada e recepção, e preparar cafés da tarde"],
          ["12:00", "13:00", "Almoço"],
          ["13:00", "14:00", "Limpeza e reposição de todas as máquinas de café"],
          ["14:00", "14:30", "Recolher e levar todos os panos (chão, limpeza e pano de prato) para a lavanderia"],
          ["14:30", "16:00", "Limpeza das salas de TI, reunião e atendimento"],
          [
            "16:00",
            "16:48",
            "Recolher garrafas vazias de café, fechar janelas dos banheiros e separar no DML os produtos de limpeza do dia seguinte",
          ],
        ]),
      },
    ],
    notes: [
      "A cada 15 dias (sextas-feiras): limpeza pesada do auditório, sala de arquivo, bebedouros e vidros",
      "A cada 15 dias (sextas-feiras): molhar as plantas",
      "1 vez por mês ou quando necessário: lavar as áreas externas com a WAP",
    ],
  },
  {
    id: "sueli",
    name: "Sueli",
    groups: [
      {
        days: ["segunda", "quarta", "quinta", "sexta"],
        blocks: blocks([
          ["07:00", "07:30", "Limpeza das mesas setor administrativo"],
          ["07:35", "07:50", "Ginástica laboral"],
          ["07:50", "08:05", "Café da manhã"],
          ["08:05", "09:30", "Limpeza dos armários das salas do administrativo (RH, comercial, financeiro e área de café)"],
          ["09:30", "10:30", "Recolher lixos (Adm, laboratório LAD, recepção e copa), limpeza do corredor administrativo térreo"],
          ["10:30", "12:00", "Início da limpeza das salas do administrativo"],
          ["12:00", "13:00", "Almoço"],
          ["13:00", "14:30", "Finalizar a limpeza de todo o setor administrativo (beiral, varrer e passar pano)"],
          ["14:30", "16:30", "Limpeza do laboratório LAD"],
        ]),
      },
      {
        days: ["terca"],
        blocks: blocks([
          ["07:00", "07:15", "Café da manhã"],
          ["07:15", "08:00", "Limpeza das mesas do setor administrativo"],
          ["08:00", "10:00", "Varrer o pátio (em equipe)"],
          ["10:00", "12:00", "Limpeza do setor administrativo (corredor, armários, beiral, varrer e passar pano) e recolher lixos"],
          ["12:00", "13:00", "Almoço"],
          ["13:00", "16:30", "Limpeza pesada do laboratório LAD"],
        ]),
      },
    ],
    notes: [
      "Atua como apoio da Cilene",
      "A cada 15 dias (sextas-feiras): molhar as plantas",
      "A cada 15 dias (sextas-feiras): limpeza pesada do auditório, sala de arquivo, bebedouros e vidros",
    ],
  },
  {
    id: "rose",
    name: "Rose",
    groups: [
      {
        days: ["segunda"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 2)"],
          ["07:35", "07:50", "Ginástica laboral"],
          ["07:50", "08:05", "Café"],
          ["08:05", "09:40", "Lavar área de lazer e lavanderia (com Angélica)"],
          ["09:40", "10:20", "Roupas"],
          ["10:20", "11:00", "Manutenção da área de lazer (sala de TV, mesas de bilhar e sofás)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "12:35", "Limpeza da sala SMSQ"],
          ["12:40", "14:00", "Limpeza do laboratório LCO e escada"],
          ["14:00", "14:50", "Limpeza da sala de jardinagem, sala de atendimento e manutenção do banheiro deficiente"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:20", "Dobrar e organizar as roupas lavadas"],
          ["16:20", "16:48", "Levar roupas limpas, trancar salas e pesar o lixo comum"],
        ]),
      },
      {
        days: ["terca"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 2)"],
          ["07:30", "07:45", "Café da manhã"],
          ["07:45", "08:00", "Limpeza da área de café (Prédio 2)"],
          ["08:00", "10:00", "Varrer o pátio (em equipe)"],
          ["10:00", "11:00", "Roupas e manutenção da área de lazer (sala de TV, mesas de bilhar e sofás)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "12:35", "Limpeza da sala SMSQ"],
          ["12:40", "14:00", "Limpeza do laboratório LCO e escada"],
          ["14:00", "14:50", "Limpeza da sala de jardinagem, sala de atendimento, manutenção do banheiro deficiente"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:20", "Dobrar e organizar as roupas lavadas"],
          ["16:20", "16:48", "Levar roupas limpas, trancar salas e pesar o lixo comum"],
        ]),
      },
      {
        days: ["quarta", "sexta"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 2)"],
          ["07:35", "07:50", "Ginástica laboral"],
          ["07:50", "08:05", "Café da manhã"],
          ["08:05", "08:15", "Limpeza da área de café (Prédio 2)"],
          ["08:15", "09:40", "Lavagem da sala de jardinagem, limpeza sala de atendimento, manutenção do banheiro deficiente"],
          ["09:40", "10:20", "Roupas"],
          ["10:20", "11:00", "Manutenção da área de lazer (sala de TV, mesas de bilhar e sofás)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "12:35", "Limpeza da sala SMSQ"],
          ["12:40", "14:00", "Limpeza do laboratório LCO e escada"],
          ["14:00", "14:50", "Limpeza da sala de jardinagem, sala de descanso, manutenção banheiro deficiente"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:20", "Dobrar e organizar as roupas lavadas"],
          ["16:20", "16:48", "Levar roupas limpas, trancar salas e pesar o lixo comum"],
        ]),
      },
      {
        days: ["quinta"],
        blocks: blocks([
          ["07:00", "07:30", "Recolher roupas (Prédio 2)"],
          ["07:30", "07:45", "Café da manhã"],
          ["07:45", "08:00", "Limpeza da área de café (Prédio 2)"],
          ["08:00", "10:00", "Roupas"],
          ["10:00", "11:00", "Manutenção da área de lazer (sala de TV, mesas de bilhar e sofás)"],
          ["11:00", "12:00", "Almoço"],
          ["12:00", "12:35", "Limpeza da sala SMSQ"],
          ["12:40", "14:00", "Limpeza do laboratório LCO e escada"],
          ["14:00", "14:50", "Limpeza da sala de jardinagem, sala de descanso e manutenção do banheiro deficiente"],
          ["15:00", "15:15", "Pausa para café"],
          ["15:15", "16:20", "Dobrar e organizar as roupas lavadas"],
          ["16:20", "16:48", "Levar roupas limpas, trancar salas e pesar o lixo comum"],
        ]),
      },
    ],
    notes: [
      "A cada 15 dias: lavagem da manutenção, apoio Angélica",
      "Uma vez por mês (sempre quinta-feira): lavagem das lixeiras",
    ],
  },
];

export function isWorkday(day: Weekday | null): day is Weekday {
  return day != null && ALL_DAYS.includes(day);
}
