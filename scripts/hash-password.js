// Gera o valor de ADMIN_PASSWORD_HASH. A senha é lida do terminal e nunca gravada em disco.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hashPassword } from '../api/_lib/password.js';

const rl = createInterface({ input: stdin, output: stdout });

const password = await rl.question('Senha (use uma senha aleatória longa, de gerenciador de senhas): ');
rl.close();

if (password.trim().length < 16) {
  console.error('\nSenha muito curta. Use pelo menos 16 caracteres aleatórios.');
  process.exit(1);
}

console.log('\nCadastre na Vercel como ADMIN_PASSWORD_HASH:\n');
console.log(await hashPassword(password));
