import { describe, it, expect } from 'vitest';
import { changedSections, commitMessage, diffLines, collapse } from '../src/admin/diff.js';

const base = {
  bio: { tagline: 'antes' },
  education: [],
  certifications: ['a'],
  commits: [],
  projects: [],
  contact: { name: 'Gabryel' },
};

describe('changedSections', () => {
  it('não acusa mudança quando nada mudou', () => {
    expect(changedSections(base, structuredClone(base))).toEqual([]);
  });

  it('lista só as seções alteradas, em ordem fixa', () => {
    const draft = structuredClone(base);
    draft.contact.name = 'outro';
    draft.bio.tagline = 'depois';
    expect(changedSections(base, draft)).toEqual(['bio', 'contact']);
  });

  it('detecta alteração dentro de lista', () => {
    const draft = structuredClone(base);
    draft.certifications.push('b');
    expect(changedSections(base, draft)).toEqual(['certifications']);
  });
});

describe('commitMessage', () => {
  it('usa os rótulos em português', () => {
    expect(commitMessage(['bio', 'projects'])).toBe('content: atualiza bio, projetos');
  });

  it('descreve uma seção só', () => {
    expect(commitMessage(['commits'])).toBe('content: atualiza experiência');
  });

  it('tem texto de reserva quando não há seção', () => {
    expect(commitMessage([])).toBe('content: atualiza o conteúdo do site');
  });
});

describe('diffLines', () => {
  it('marca linha adicionada', () => {
    expect(diffLines('a\nb', 'a\nb\nc')).toEqual([
      { type: 'context', text: 'a' },
      { type: 'context', text: 'b' },
      { type: 'added', text: 'c' },
    ]);
  });

  it('marca linha removida', () => {
    expect(diffLines('a\nb\nc', 'a\nc')).toEqual([
      { type: 'context', text: 'a' },
      { type: 'removed', text: 'b' },
      { type: 'context', text: 'c' },
    ]);
  });

  it('marca substituição como remoção seguida de adição', () => {
    const rows = diffLines('a\nb', 'a\nz');
    expect(rows).toContainEqual({ type: 'removed', text: 'b' });
    expect(rows).toContainEqual({ type: 'added', text: 'z' });
  });

  it('devolve só contexto quando os textos são iguais', () => {
    expect(diffLines('x\ny', 'x\ny').every((row) => row.type === 'context')).toBe(true);
  });
});

describe('collapse', () => {
  it('resume trechos longos sem alteração', () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({ type: 'context', text: `l${i}` }));
    rows.push({ type: 'added', text: 'novo' });
    const resultado = collapse(rows, 2);
    expect(resultado[0]).toEqual({ type: 'gap', count: 18 });
    expect(resultado.at(-1)).toEqual({ type: 'added', text: 'novo' });
  });

  it('não resume quando é tudo curto', () => {
    const rows = [
      { type: 'context', text: 'a' },
      { type: 'added', text: 'b' },
    ];
    expect(collapse(rows, 3)).toEqual(rows);
  });
});
