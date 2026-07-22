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
        date: '[PLACEHOLDER — período na C.Vale]',
        role: 'Assistente Técnico',
        additions: [
          '[PLACEHOLDER — conquista/entrega concreta na C.Vale]',
          '[PLACEHOLDER — conquista 2]',
        ],
        removals: ['[PLACEHOLDER — problema/processo manual resolvido]'],
        stack: ['[PLACEHOLDER — stack usada na C.Vale]'],
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
        date: '[PLACEHOLDER — período no cargo atual]',
        role: 'Especialista em Documentação Técnica (ERP)',
        additions: [
          'Corrigiu workflow de sincronização bidirecional SQL Server ↔ Sense Data (Cancelamentos.json), eliminando falha de SQL injection',
          'Migrou fluxo de onboarding de novos colaboradores do Kubo LMS para uma FastAPI interna',
          'Produziu roteiros e slides para a "Universidade Inside" sobre a reforma tributária (IBS/CBS/IS)',
        ],
        removals: ['Eliminou falha de segurança (SQL injection) em workflow crítico de cancelamentos'],
        stack: ['n8n', 'SQL Server', 'FastAPI', 'ElevenLabs TTS'],
      },
      {
        date: '[PLACEHOLDER — período no cargo anterior]',
        role: '[PLACEHOLDER — cargo anterior na Inside Sistemas]',
        additions: [
          '[PLACEHOLDER — conquista no cargo anterior]',
          '[PLACEHOLDER — conquista 2]',
        ],
        removals: ['[PLACEHOLDER — problema resolvido no cargo anterior]'],
        stack: ['[PLACEHOLDER — stack usada no cargo anterior]'],
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
    href: '#',
  },
  {
    id: 'orcamento-v2',
    filename: 'orcamento-v2.ts',
    name: 'Orçamento.V2',
    description:
      'SaaS multi-tenant de gestão de orçamentos, com monorepo pnpm/Turborepo e backend em DDD. Passou por um ciclo completo de revisão técnica, elevando a nota de qualidade de 6.0 para 7.5/10.',
    stack: ['NestJS', 'Drizzle ORM', 'PostgreSQL', 'React', 'Turborepo'],
    href: '#',
  },
  {
    id: 'price-drop',
    filename: 'price-drop-bot.py',
    name: 'PRICE DROP',
    description:
      'Automação de afiliados para TikTok e Instagram (nicho moda feminina) — pipelines com avatar de IA e overlay de texto, geração de posts com Sharp/node-canvas e funil de monetização via WhatsApp.',
    stack: ['FFmpeg', 'HeyGen', 'Sharp', 'node-canvas'],
    href: '#',
  },
];

export const contact = {
  email: 'gabryelpaiva123@gmail.com',
  github: 'OPaiva-1721',
  whatsapp: '[PLACEHOLDER — link do whatsapp, ex: https://wa.me/55DDNUMERO]',
};