import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { bio } from '../data/content.js';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SECTION_IDS = ['sobre', 'experiencia', 'projetos', 'contato'];
const DEFAULT_PLACEHOLDER = "digite 'help' pra ver os comandos";

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
      return { lines: [bio.tagline], variant: 'ok' };
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
        // não navega sozinho numa suposição — deixa o comando pronto pra
        // confirmar com um Enter a mais, em vez de agir por conta própria.
        return {
          lines: [`cd: '${target}' não existe — pressione Enter de novo pra ir em '${suggestion}'`],
          variant: 'error',
          prefill: `cd ${suggestion}`,
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

const TerminalPrompt = forwardRef(function TerminalPrompt(_props, ref) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);
  const [commandLog, setCommandLog] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(null);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const hintPlayedRef = useRef(false);
  const hintTimersRef = useRef([]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // limpa timers de digitação fantasma se o componente desmontar no meio
  useEffect(() => () => hintTimersRef.current.forEach(clearTimeout), []);

  // dica única (não interativa) de que o prompt é digitável de verdade:
  // "digita" a palavra help no placeholder e apaga em seguida. Chamada pelo
  // Hero quando a animação de entrada termina; nunca roda com reduced-motion.
  useImperativeHandle(ref, () => ({
    playIntroHint() {
      if (hintPlayedRef.current || prefersReducedMotion()) return;
      hintPlayedRef.current = true;

      const word = 'help';
      const typeDelay = 90;
      const eraseDelay = 60;
      const holdDelay = 700;

      for (let i = 1; i <= word.length; i++) {
        hintTimersRef.current.push(
          setTimeout(() => setPlaceholder(word.slice(0, i)), typeDelay * i)
        );
      }

      const eraseStart = typeDelay * word.length + holdDelay;
      for (let i = word.length - 1; i >= 0; i--) {
        hintTimersRef.current.push(
          setTimeout(
            () => setPlaceholder(word.slice(0, i)),
            eraseStart + eraseDelay * (word.length - i)
          )
        );
      }
      hintTimersRef.current.push(
        setTimeout(
          () => setPlaceholder(DEFAULT_PLACEHOLDER),
          eraseStart + eraseDelay * word.length + 400
        )
      );
    },
  }));

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      if (commandLog.length === 0) return;
      e.preventDefault();
      const nextIndex = historyIndex === null ? commandLog.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setValue(commandLog[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      if (historyIndex === null) return;
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandLog.length) {
        setHistoryIndex(null);
        setValue('');
      } else {
        setHistoryIndex(nextIndex);
        setValue(commandLog[nextIndex]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = runCommand(value);
    const submitted = value.trim();
    setHistoryIndex(null);

    if (!result) return;

    if (submitted) {
      setCommandLog((prev) => [...prev, submitted]);
    }

    if (result.clear) {
      setValue('');
      setHistory([]);
      return;
    }

    setValue(result.prefill ?? '');
    setHistory((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        command: submitted,
        lines: result.lines,
        variant: result.variant,
      },
    ]);
  };

  return (
    <div className="terminal">
      <form
        className="terminal-prompt"
        onSubmit={handleSubmit}
        onClick={() => inputRef.current?.focus()}
      >
        <span className="terminal-prompt-symbol" aria-hidden="true">
          $
        </span>
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          aria-label="Terminal de comando opcional — digite um comando e pressione Enter; setas pra cima/baixo repetem comandos anteriores"
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
});

export default TerminalPrompt;
