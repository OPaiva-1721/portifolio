import { useCallback, useEffect, useMemo, useState } from 'react';
import { changedSections } from './diff.js';

const STORAGE_KEY = 'portfolio-admin-draft';

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Modo privado ou armazenamento cheio: o rascunho segue em memória.
  }
}

function clearStored() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada a fazer.
  }
}

// O rascunho guardado só é reaproveitado se corresponder ao mesmo sha que o
// servidor acabou de devolver. Se o conteúdo mudou no repositório, o rascunho
// antigo é descartado para não reescrever alterações que não estão à vista.
export default function useDraft(server) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    // Sincroniza o rascunho local com uma fonte externa (localStorage) sempre que o
    // `server` muda — mesmo padrão já usado em AdminApp.jsx para o fetch inicial.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!server) {
      setDraft(null);
      return;
    }
    const stored = readStored();
    if (stored && stored.sha === server.sha) {
      setDraft(stored.content);
    } else {
      clearStored();
      setDraft(structuredClone(server.content));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [server]);

  useEffect(() => {
    if (server && draft) writeStored({ sha: server.sha, content: draft });
  }, [server, draft]);

  const setSection = useCallback((key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const changed = useMemo(
    () => (server && draft ? changedSections(server.content, draft) : []),
    [server, draft],
  );

  const discard = useCallback(() => {
    if (!server) return;
    clearStored();
    setDraft(structuredClone(server.content));
  }, [server]);

  return { draft, setSection, changed, discard };
}
