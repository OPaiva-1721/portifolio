import { describe, it, expect } from 'vitest';
import content from '../src/data/content.json';
import {
  validateContent,
  SECTION_KEYS,
  MAX_CONTENT_BYTES,
  emptyProject,
  emptyCommit,
  emptyRole,
  emptyEducation,
  randomCommitHash,
} from '../src/data/schema.js';

function clone() {
  return structuredClone(content);
}

describe('validateContent', () => {
  it('aceita o conteúdo real do site', () => {
    expect(validateContent(content)).toEqual({ ok: true });
  });

  it('recusa o que não é objeto', () => {
    expect(validateContent(null).ok).toBe(false);
    expect(validateContent([]).ok).toBe(false);
    expect(validateContent('texto').ok).toBe(false);
  });

  it('recusa seção ausente', () => {
    const doc = clone();
    delete doc.projects;
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('projects');
  });

  it('recusa chave desconhecida no topo', () => {
    const doc = clone();
    doc.extra = 1;
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('extra');
  });

  it('recusa chave desconhecida dentro de um projeto', () => {
    const doc = clone();
    doc.projects[0].cor = 'azul';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa tipo errado', () => {
    const doc = clone();
    doc.bio.stack = 'TypeScript';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa texto obrigatório vazio', () => {
    const doc = clone();
    doc.projects[0].name = '   ';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa id duplicado', () => {
    const doc = clone();
    doc.projects[1].id = doc.projects[0].id;
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('duplicado');
  });

  it('recusa hash de commit fora do formato', () => {
    const doc = clone();
    doc.commits[0].hash = 'XYZ';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('aceita tag nula mas recusa tag numérica', () => {
    const doc = clone();
    doc.commits[0].tag = null;
    expect(validateContent(doc).ok).toBe(true);
    doc.commits[0].tag = 7;
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa showInCv que não é booleano', () => {
    const doc = clone();
    doc.projects[0].showInCv = 'sim';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa href que não é https', () => {
    const doc = clone();
    doc.projects[0].href = 'javascript:alert(1)';
    expect(validateContent(doc).ok).toBe(false);
  });

  it('recusa documento acima do limite de tamanho', () => {
    const doc = clone();
    doc.bio.text = 'x'.repeat(MAX_CONTENT_BYTES + 1);
    const result = validateContent(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('tamanho');
  });

  it('recusa lista de strings com item vazio', () => {
    const doc = clone();
    doc.certifications = ['Google Cloud Cybersecurity', ''];
    expect(validateContent(doc).ok).toBe(false);
  });
});

describe('itens novos', () => {
  it('cria projeto válido dentro do documento', () => {
    const doc = clone();
    const novo = emptyProject();
    novo.id = 'novo-projeto';
    novo.name = 'Projeto novo';
    novo.filename = 'novo.ts';
    novo.description = 'Descrição';
    novo.href = 'https://github.com/OPaiva-1721/novo';
    doc.projects.push(novo);
    expect(validateContent(doc)).toEqual({ ok: true });
    expect(novo.showInCv).toBe(true);
  });

  it('cria commit com cargo e hash válidos', () => {
    const doc = clone();
    const novo = emptyCommit();
    novo.id = 'empresa-nova';
    novo.scope = 'empresa-nova';
    const cargo = emptyRole();
    cargo.date = 'Jan de 2027 — o momento';
    cargo.role = 'Desenvolvedor';
    novo.roles = [cargo];
    doc.commits.unshift(novo);
    expect(validateContent(doc)).toEqual({ ok: true });
  });

  it('cria formação válida dentro do documento', () => {
    const doc = clone();
    const nova = emptyEducation();
    nova.id = 'nova-formacao';
    nova.degree = 'Ciência da Computação';
    nova.institution = 'Universidade Nova';
    nova.period = '2028 — previsão 2032';
    nova.description = 'Descrição';
    doc.education.push(nova);
    expect(validateContent(doc)).toEqual({ ok: true });
  });
});

describe('randomCommitHash', () => {
  it('gera 7 caracteres hexadecimais minúsculos', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(randomCommitHash()).toMatch(/^[0-9a-f]{7}$/);
    }
  });
});

describe('SECTION_KEYS', () => {
  it('tem a ordem fixa das seções', () => {
    expect(SECTION_KEYS).toEqual([
      'bio',
      'education',
      'certifications',
      'commits',
      'projects',
      'contact',
    ]);
  });
});
