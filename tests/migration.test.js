// tests/migration.test.js
import { describe, it, expect } from 'vitest';
import { bio, education, certifications, commits, projects, contact } from '../src/data/content.js';

describe('conteúdo do portfólio', () => {
  it('mantém a bio', () => {
    expect(bio.tagline).toBe(
      'Desenvolvedor de software com foco em automação — transformo processos manuais em fluxos que rodam sozinhos.',
    );
    expect(bio.text).toContain('Engenharia de Software no Biopark');
    expect(bio.stack).toHaveLength(9);
    expect(bio.stack[0]).toBe('TypeScript');
    expect(bio.stack).toContain('Drizzle ORM');
    expect(bio.softSkills).toEqual([
      'Raciocínio lógico',
      'Comunicação assertiva',
      'Proatividade',
      'Responsabilidade',
    ]);
  });

  it('mantém a formação', () => {
    expect(education).toHaveLength(1);
    expect(education[0].id).toBe('biopark');
    expect(education[0].degree).toBe('Engenharia de Software');
    expect(education[0].institution).toBe('Faculdade Biopark');
    expect(education[0].period).toBe('2023 — previsão 2027 · Toledo, Paraná');
    expect(education[0].description).toContain('Banco de Questões Donaduzzi');
  });

  it('mantém as certificações', () => {
    expect(certifications).toEqual([
      'Google Cloud Cybersecurity',
      'Google Cloud IA Generativa',
      'Inglês técnico',
      'Pacote Office',
    ]);
  });

  it('mantém a experiência', () => {
    expect(commits.map((c) => c.id)).toEqual(['inside-sistemas', 'c.vale', 'Iriedi']);
    expect(commits.map((c) => c.hash)).toEqual(['a1f3c9d', 'e7b2001', '4d8f61a']);
    expect(commits[0].tag).toBe('Atual');
    expect(commits[1].tag).toBeNull();
    expect(commits[0].scope).toBe('inside-sistemas');
    expect(commits[0].roles).toHaveLength(2);
    expect(commits[0].roles[0].role).toBe('Analista de Criação de Vídeo · Automação de Processos');
    expect(commits[0].roles[0].additions).toHaveLength(4);
    expect(commits[0].roles[0].stack).toContain('n8n');
    expect(commits[0].roles[0].removals).toEqual([]);
    expect(commits[2].roles[0].role).toBe('Assistente Administrativo (Jovem Aprendiz)');
  });

  it('mantém os projetos', () => {
    expect(projects.map((p) => p.id)).toEqual(['barberfoundation', 'orcamento-v2', 'price-drop']);
    expect(projects[0].name).toBe('BarberFoundation');
    expect(projects[0].filename).toBe('barber-foundation.dart');
    expect(projects[0].href).toBe('https://github.com/BarberFoundation');
    expect(projects[1].stack).toContain('Drizzle ORM');
    expect(projects[2].name).toBe('PRICE DROP');
  });

  it('mantém o contato', () => {
    expect(contact).toEqual({
      name: 'Gabryel Paiva Neves',
      email: 'gabryelpaiva123@gmail.com',
      github: 'OPaiva-1721',
      whatsapp: 'https://wa.me/554498727549',
    });
  });
});
