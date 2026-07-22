// Centraliza todo o conteúdo editável do site.
// Troque os valores marcados como placeholder pelo seu conteúdo real.

export const bio = {
  placeholder: '[PLACEHOLDER — escreva sua bio aqui]',
  example: `Ex: desenvolvedor focado em transformar processos manuais em
  sistemas confiáveis, com passagem por agroindústria, sistemas de gestão
  e pesquisa aplicada. Gosto de entender o problema antes de abrir o editor.`,
  stack: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'PostgreSQL',
    'Docker',
    'Git',
    '[edite sua stack real]',
  ],
};

export const commits = [
  {
    id: 'c.vale',
    hash: 'c.vale',
    date: '2024 → atual',
    tag: 'HEAD',
    scope: 'c.vale',
    role: '[PLACEHOLDER — seu cargo na C.Vale]',
    additions: [
      '[placeholder conquista 1 — ex: automatizou processo X, reduzindo Y horas/semana]',
      '[placeholder conquista 2]',
    ],
    removals: [
      '[placeholder problema resolvido 1 — ex: eliminou retrabalho manual em Z]',
      '[placeholder problema resolvido 2]',
    ],
    stack: ['[stack usada]'],
  },
  {
    id: 'inside-sistemas',
    hash: 'inside-sis',
    date: '[período placeholder]',
    tag: null,
    scope: 'inside-sistemas',
    role: '[PLACEHOLDER — seu cargo na Inside Sistemas]',
    additions: ['[placeholder conquista 1]', '[placeholder conquista 2]'],
    removals: ['[placeholder problema resolvido 1]', '[placeholder problema resolvido 2]'],
    stack: ['[stack usada]'],
  },
  {
    id: 'biopark',
    hash: 'biopark',
    date: '[período placeholder]',
    tag: 'root-commit',
    scope: 'biopark',
    role: '[PLACEHOLDER — seu cargo/curso na Biopark]',
    additions: [
      '[placeholder conquista 1 — primeira experiência, projeto de destaque]',
      '[placeholder conquista 2]',
    ],
    removals: ['[placeholder problema resolvido 1]'],
    stack: ['[stack usada]'],
  },
];

export const projects = [
  {
    id: 'projeto-um',
    filename: 'projeto-um.tsx',
    name: '[Nome do projeto 1]',
    description: '[Descrição curta — o problema que resolve e o resultado prático]',
    stack: ['React', 'Node.js'],
    href: '#',
  },
  {
    id: 'projeto-dois',
    filename: 'projeto-dois.py',
    name: '[Nome do projeto 2]',
    description: '[Descrição curta — o problema que resolve e o resultado prático]',
    stack: ['Python', 'PostgreSQL'],
    href: '#',
  },
  {
    id: 'projeto-tres',
    filename: 'projeto-tres.go',
    name: '[Nome do projeto 3]',
    description: '[Descrição curta — o problema que resolve e o resultado prático]',
    stack: ['Docker', 'CI/CD'],
    href: '#',
  },
];

export const contact = {
  email: 'gabryelpaiva123@gmail.com',
  github: '[seu-usuario-github]',
  whatsapp: '[whatsapp-link]',
};
