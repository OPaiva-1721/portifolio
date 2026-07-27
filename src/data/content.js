// Centraliza todo o conteúdo editável do site.

export const bio = {
  text: `Sou estudante de Engenharia de Software no Biopark e desenvolvedor de automações, um profissional dedicado, proativo e movido por desafios. Tenho experiência no desenvolvimento de automações, suporte técnico, desenvolvimento de software e criação de conteúdo. Aprendo de forma autodidata, trabalho bem em equipe e utilizo o raciocínio lógico para criar soluções e otimizar processos.`,
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
  softSkills: ['Raciocínio lógico', 'Comunicação assertiva', 'Proatividade', 'Responsabilidade'],
};

export const education = [
  {
    id: 'biopark',
    degree: 'Engenharia de Software',
    institution: 'Faculdade Biopark',
    period: '2023 — previsão 2027 · Toledo, Paraná',
    description:
      'Um dos projetos que mais gostei de desenvolver foi o Banco de Questões Donaduzzi, um sistema completo em Flutter e Firebase para gerenciamento de provas, banco de questões, montagem personalizada de avaliações e correção automática, utilizando arquitetura em camadas e padrões como Facade, Repository e Singleton.',
  },
];

export const certifications = [
  'Google Cloud Cybersecurity',
  'Google Cloud IA Generativa',
  'Inglês técnico',
  'Pacote Office',
];

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
          'Desenvolvo fluxos de automação para integração entre sistemas e bancos de dados',
          'Roteirizo, produzo slides e utilizo TTS para os conteúdos da Universidade Inside',
          'Desenvolvo materiais audiovisuais para treinamento e capacitação de usuários',
          'Produzo conteúdos que facilitam o aprendizado e o uso dos sistemas da empresa',
        ],
        removals: [],
        stack: ['Automação (n8n)', 'Roteirização', 'Produção de Vídeo', 'TTS'],
      },
      {
        date: 'Fev de 2026 — jun de 2026 · 5 meses · Toledo, Paraná · Estágio',
        role: 'Estagiário',
        additions: [
          'Documentei tecnicamente os sistemas ERP Service e EuGestor',
          'Produzi e formatei artigos para a base de conhecimento da empresa',
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
          'Realizei manutenção de computadores e suporte técnico para diversos departamentos',
          'Apliquei boas práticas e novas tecnologias para otimizar processos e a infraestrutura de TI',
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
          'Prestei atendimento ao público e auxiliei na organização e conferência de estoque',
          'Realizei o preenchimento de planilhas e o arquivamento de documentos nas rotinas administrativas',
        ],
        removals: [],
        stack: ['Excel', 'Atendimento', 'Gestão de Estoque'],
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
      'Desenvolvi uma plataforma de agendamento para barbearias, com aplicativo em Flutter, painel administrativo em React e backend em NestJS seguindo DDD. O foco é aumentar a retenção de clientes por meio de fidelidade, lembretes e indicações.',
    stack: ['Flutter', 'NestJS', 'React', 'Supabase', 'Fly.io'],
    href: 'https://github.com/BarberFoundation',
  },
  {
    id: 'orcamento-v2',
    filename: 'orcamento-v2.ts',
    name: 'Orçamento.V2',
    description:
      'Desenvolvi um SaaS multi-tenant para gestão de orçamentos utilizando monorepo com pnpm/Turborepo e backend em DDD. O projeto passou por uma revisão técnica completa, elevando sua qualidade de 6,0 para 7,5/10.',
    stack: ['NestJS', 'Drizzle ORM', 'PostgreSQL', 'React', 'Turborepo'],
    href: 'https://github.com/OPaiva-1721/Orcamento.V2',
  },
];

export const contact = {
  name: 'Gabryel Paiva Neves',
  email: 'gabryelpaiva123@gmail.com',
  github: 'OPaiva-1721',
  whatsapp: 'https://wa.me/554498727549',
};