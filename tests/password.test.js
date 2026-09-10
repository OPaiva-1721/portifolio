import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../api/_lib/password.js';

describe('hash de senha', () => {
  it('aceita a senha correta', async () => {
    const stored = await hashPassword('senha-longa-de-teste-123');
    expect(await verifyPassword('senha-longa-de-teste-123', stored)).toBe(true);
  });

  it('recusa a senha errada', async () => {
    const stored = await hashPassword('senha-longa-de-teste-123');
    expect(await verifyPassword('senha-errada', stored)).toBe(false);
  });

  it('gera salt diferente a cada chamada', async () => {
    const a = await hashPassword('mesma-senha');
    const b = await hashPassword('mesma-senha');
    expect(a).not.toBe(b);
    expect(await verifyPassword('mesma-senha', a)).toBe(true);
    expect(await verifyPassword('mesma-senha', b)).toBe(true);
  });

  it('recusa hash malformado sem lançar erro', async () => {
    expect(await verifyPassword('x', '')).toBe(false);
    expect(await verifyPassword('x', 'lixo')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$1$2')).toBe(false);
    expect(await verifyPassword('x', undefined)).toBe(false);
  });
});
