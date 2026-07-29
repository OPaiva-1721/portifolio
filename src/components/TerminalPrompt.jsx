import { useEffect, useRef, useState } from 'react';
import { bio } from '../data/content.js';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SECTION_IDS = ['sobre', 'experiencia', 'projetos', 'contato'];

const HELP_LINES = [
  'cd <sobre|experiencia|projetos|contato> — navega até a seção',
  'whoami — quem sou eu',
  'cat curriculo — abre o currículo em PDF',
  'ls — lista as seções',
  'clear — limpa o histórico',
];

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function closestMatch(input, candidates, maxDistance = 2) {
  let best = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = levenshtein(input, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return bestDistance <= maxDistance ? best : null;
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

// Comandos "oficiais" ficam em HELP_LINES; os easter eggs (git log, sudo
// hire gabryel) são deliberadamente omitidos de lá — parte da graça é achar.
function runCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const [cmd, ...args] = lower.split(/\s+/);

  switch (cmd) {
    case 'whoami':
      return { lines: [bio.text], variant: 'ok' };
    case 'ls':
      return { lines: [`${SECTION_IDS.join('  ')}  curriculo.pdf`], variant: 'ok' };
    case 'help':
      return { lines: HELP_LINES, variant: 'ok' };
    case 'clear':
      return { clear: true };
    case 'pwd':
      return { lines: ['/home/gabryel/portfolio'], variant: 'ok' };
    case 'cd': {
      const target = args[0];
      if (target && SECTION_IDS.includes(target)) {
        scrollToSection(target);
        return { lines: [`→ navegando até ~/${target}`], variant: 'ok' };
      }
      const suggestion = target ? closestMatch(target, SECTION_IDS) : null;
      if (suggestion) {
        scrollToSection(suggestion);
        return {
          lines: [`cd: '${target}' não existe — indo para '${suggestion}'`],
          variant: 'ok',
        };
      }
      return { lines: [`cd: uso: cd <${SECTION_IDS.join('|')}>`], variant: 'error' };
    }
    case 'cat': {
      const target = args[0];
      if (target && ['curriculo', 'cv', 'curriculo.pdf'].includes(target)) {
        window.open('/#cv', '_blank', 'noopener,noreferrer');
        return { lines: ['abrindo curriculo.pdf em nova aba...'], variant: 'ok' };
      }
      return {
        lines: [`cat: ${target || 'arquivo'}: não encontrado — tente 'cat curriculo'`],
        variant: 'error',
      };
    }
    case 'git': {
      if (args[0] === 'log') {
        scrollToSection('experiencia');
        return {
          lines: ['git log --author="Gabryel Paiva Neves"', 'navegando até ~/experiencia'],
          variant: 'ok',
        };
      }
      return { lines: ["git: comando desconhecido — tente 'git log'"], variant: 'error' };
    }
    case 'sudo': {
      if (lower === 'sudo hire gabryel') {
        return {
          lines: ['sudo: essa permissão não é minha pra dar 🙂', 'tente: cat contato'],
          variant: 'ok',
        };
      }
      return { lines: ['sudo: comando não permitido aqui'], variant: 'error' };
    }
    default: {
      const suggestion = closestMatch(cmd, [
        'cd',
        'whoami',
        'cat',
        'ls',
        'help',
        'clear',
        'git',
        'sudo',
        'pwd',
      ]);
      return {
        lines: suggestion
          ? [`bash: ${cmd}: comando não encontrado — você quis dizer '${suggestion}'?`]
          : [`bash: ${cmd}: comando não encontrado (digite 'help')`],
        variant: 'error',
      };
    }
  }
}

export default function TerminalPrompt() {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);
  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = runCommand(value);
    const submitted = value;
    setValue('');
    if (!result) return;
    if (result.clear) {
      setHistory([]);
      return;
    }
    setHistory((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        command: submitted.trim(),
        lines: result.lines,
        variant: result.variant,
      },
    ]);
  };

  return (
    <div className="terminal">
      <form className="terminal-prompt" onSubmit={handleSubmit}>
        <span className="terminal-prompt-symbol" aria-hidden="true">
          $
        </span>
        <input
          className="terminal-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="digite 'help' pra ver os comandos"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          aria-label="Terminal de comando opcional — digite um comando e pressione Enter"
        />
      </form>
      <div className="terminal-history" ref={historyRef} aria-live="polite">
        {history.map((entry) => (
          <div className="terminal-entry" key={entry.id}>
            <p className="terminal-entry-cmd">
              <span className="terminal-prompt-symbol" aria-hidden="true">
                $
              </span>{' '}
              {entry.command}
            </p>
            {entry.lines.map((line, i) => (
              <p
                key={i}
                className={`terminal-out${entry.variant === 'error' ? ' is-error' : ''}`}
              >
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
