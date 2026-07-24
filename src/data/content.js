// Centraliza todo o conteúdo editável do site.
// Troque os valores marcados como placeholder pelo seu conteúdo real.

export const bio = {
  text: `Estudante de Engenharia de Software no Biopark, sou um profissional dedicado e proativo, com
  experiência administrativa, suporte técnico, desenvolvimento e criação. Aprendo de forma autodidata, 
  trabalho bem em equipe e aplico raciocínio lógico para otimizar resultados.`,
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
    id: 'inside-sistemas',
    hash: 'Inside-Sistemas',
    tag: 'Atual',
    scope: 'inside-sistemas',
    roles: [
      {
        date: 'Jul de 2026 — o momento · 1 mês · Toledo, Paraná · Tempo integral',
        role: 'Analista de Criação de Vídeo',
        additions: [
          'Corrigiu workflow de sincronização bidirecional SQL Server ↔ Sense Data (Cancelamentos.json), eliminando falha de SQL injection',
          'Migrou fluxo de onboarding de novos colaboradores do Kubo LMS para uma FastAPI interna',
          'Roteirização, produção de slides e narração com TTS para a "Universidade Inside"',
        ],
        removals: ['Eliminou falha de segurança (SQL injection) em workflow crítico de cancelamentos'],
        stack: ['n8n', 'SQL Server', 'FastAPI', 'TTS'],
      },
      {
        date: 'Fev de 2026 — jun de 2026 · 5 meses · Toledo, Paraná · Estágio',
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
    id: 'c.vale',
    hash: 'C.vale',
    tag: null,
    scope: 'c.vale',
    roles: [
      {
        date: 'Set de 2024 — jan de 2026 · 1 ano 5 meses · Palotina, Paraná',
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
    id: 'Iriedi',
    hash: 'Iriedi',
    tag: null,
    scope: 'i.riedi',
    roles: [
      {
        date: 'Mai de 2022 — abr de 2024 · 2 anos · Palotina, Paraná',
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
    hash: 'Biopark',
    tag: 'root-commit',
    scope: 'biopark',
    roles: [
      {
        date: '2023 — previsão 2027 · 4 anos · Toledo, Paraná',
        role: 'Estudante de Engenharia de Software',
        additions: [
          'Um dos projetos que mais gostei foi o Banco de Questões Donaduzzi — sistema completo de gerenciamento de provas em Flutter/Firebase para instituições de ensino: banco de questões, montagem de provas customizadas e correção automática',
          'Arquitetura em camadas (UI, serviços, utilitários, core) com padrões Facade, Repository e Singleton; multiplataforma (Android, iOS, Web, Windows, macOS, Linux)',
        ],
        removals: [],
        stack: ['Flutter', 'Firebase', 'Clean Architecture', 'BLoC/Riverpod'],
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
      'Plataforma de agendamento para barbearias — mobile em Flutter, admin em React e backend NestJS/DDD. Foco em mecânicas de retenção (fidelidade, lembretes, indicações) mantendo infra.',
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
  name: 'Gabryel Paiva Neves',
  email: 'gabryelpaiva123@gmail.com',
  github: 'OPaiva-1721',
  whatsapp: 'https://wa.me/554498727549',
};