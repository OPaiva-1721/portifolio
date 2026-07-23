// Centraliza todo o conteúdo editável do site.
// Troque os valores marcados como placeholder pelo seu conteúdo real.

export const bio = {
  text: `Estudante de Engenharia de Software na Biopark, atuando como
  Assistente Técnico na C.Vale Cooperativa Agroindustrial e estagiário
  na Inside Sistemas produzindo documentação técnica para ERPs. Gosto de
  transformar processo manual e workflow travado em sistema que funciona
  sozinho — automação, arquitetura DDD e um pouco de conteúdo educacional
  pelo caminho.`,
  stack: [
    'TypeScript',
    'React',
    'NestJS',
    'Flutter',
    'Node.js',
    'Python',
    'PostgreSQL',
    'Docker',
    'Drizzle ORM',
  ],
};

export const commits = [
  {
    id: 'c.vale',
    hash: 'c.vale',
    tag: 'HEAD',
    scope: 'c.vale',
    roles: [
      {
        date: 'set de 2024 — jan de 2026 · 1 ano 5 meses · Palotina, Paraná',
        role: 'Jovem Aprendiz T.I.',
        additions: [
          'Manutenção de computadores e suporte técnico pra diversos departamentos da empresa',
          'Aplicou boas práticas e novas tecnologias pra otimizar processos e infraestrutura de TI',
        ],
        removals: [],
        stack: ['Suporte Técnico', 'Manutenção de Hardware', 'Infraestrutura de TI'],
      },
    ],
  },
  {
    id: 'inside-sistemas',
    hash: 'inside-sis',
    tag: null,
    scope: 'inside-sistemas',
    roles: [
      {
        date: 'jul de 2026 — o momento · 1 mês · Toledo, Paraná · Tempo integral',
        role: 'Analista de Criação de Vídeo',
        additions: [
          'Corrigiu workflow de sincronização bidirecional SQL Server ↔ Sense Data (Cancelamentos.json), eliminando falha de SQL injection',
          'Migrou fluxo de onboarding de novos colaboradores do Kubo LMS para uma FastAPI interna',
          'Roteirização, produção de slides e narração com TTS para a "Universidade Inside"',
        ],
        removals: ['Eliminou falha de segurança (SQL injection) em workflow crítico de cancelamentos'],
        stack: ['n8n', 'SQL Server', 'FastAPI', 'ElevenLabs TTS'],
      },
      {
        date: 'fev de 2026 — jun de 2026 · 5 meses · Toledo, Paraná · Estágio',
        role: 'Estagiário',
        additions: [
          'Documentação técnica dos sistemas ERP Service e EuGestor',
          'Produziu e formatou artigos de suporte para a base de conhecimento',
        ],
        removals: [],
        stack: ['ERP Service', 'EuGestor', 'Documentação Técnica'],
      },
    ],
  },
  {
    id: 'iriedi',
    hash: 'iriedi',
    tag: null,
    scope: 'i.riedi',
    roles: [
      {
        date: 'mai de 2022 — abr de 2024 · 2 anos · Palotina, Paraná',
        role: 'Assistente Administrativo (Jovem Aprendiz)',
        additions: [
          'Apoiou atendimento ao público e organização/conferência de estoque',
          'Preenchimento de planilhas e arquivamento de documentos no dia a dia administrativo',
        ],
        removals: [],
        stack: ['Excel', 'Atendimento', 'Gestão de estoque'],
      },
    ],
  },
  {
    id: 'biopark',
    hash: 'biopark',
    tag: 'root-commit',
    scope: 'biopark',
    roles: [
      {
        date: '[PLACEHOLDER — ano de início]',
        role: 'Estudante de Engenharia de Software',
        additions: ['[PLACEHOLDER — projeto/trabalho de destaque na faculdade]'],
        removals: [],
        stack: ['Flutter', 'Clean Architecture', 'BLoC/Riverpod'],
      },
    ],
  },
];

export const projects = [
  {
    id: 'barberfoundation',
    filename: 'barber-foundation.dart',
    name: 'BarberFoundation',
    description:
      'Plataforma de agendamento para barbearias — mobile em Flutter, admin em React e backend NestJS/DDD. Foco em mecânicas de retenção (fidelidade, lembretes, indicações) mantendo infra abaixo de R$150/mês.',
    stack: ['Flutter', 'NestJS', 'React', 'Supabase', 'Fly.io'],
    href: 'https://github.com/BarberFoundation',
  },
  {
    id: 'orcamento-v2',
    filename: 'orcamento-v2.ts',
    name: 'Orçamento.V2',
    description:
      'SaaS multi-tenant de gestão de orçamentos, com monorepo pnpm/Turborepo e backend em DDD. Passou por um ciclo completo de revisão técnica, elevando a nota de qualidade de 6.0 para 7.5/10.',
    stack: ['NestJS', 'Drizzle ORM', 'PostgreSQL', 'React', 'Turborepo'],
    href: 'https://github.com/OPaiva-1721/Orcamento.V2',
  },
  {
    id: 'price-drop',
    filename: 'price-drop-bot.py',
    name: 'PRICE DROP',
    description:
      'Automação de afiliados para TikTok e Instagram (nicho moda feminina) — pipelines com avatar de IA e overlay de texto, geração de posts com Sharp/node-canvas e funil de monetização via WhatsApp.',
    stack: ['FFmpeg', 'HeyGen', 'Sharp', 'node-canvas'],
    href: 'https://github.com/OPaiva-1721/Instabot-v2',
  },
];

export const contact = {
  email: 'gabryelpaiva123@gmail.com',
  github: 'OPaiva-1721',
  whatsapp: 'https://wa.me/5544998727549',
};