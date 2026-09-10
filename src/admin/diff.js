import { SECTION_KEYS, SECTION_LABELS } from '../data/schema.js';

export function changedSections(base, draft) {
  return SECTION_KEYS.filter((key) => JSON.stringify(base?.[key]) !== JSON.stringify(draft?.[key]));
}

export function commitMessage(sections) {
  if (sections.length === 0) return 'content: atualiza o conteúdo do site';
  return `content: atualiza ${sections.map((key) => SECTION_LABELS[key]).join(', ')}`;
}

// Diff por linha via maior subsequência comum. As seções têm algumas centenas de
// linhas, então a tabela quadrática é barata e o resultado é mais legível que
// qualquer heurística.
export function diffLines(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const lengths = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));

  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const rows = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push({ type: 'context', text: a[i] });
      i += 1;
      j += 1;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      rows.push({ type: 'removed', text: a[i] });
      i += 1;
    } else {
      rows.push({ type: 'added', text: b[j] });
      j += 1;
    }
  }
  while (i < a.length) {
    rows.push({ type: 'removed', text: a[i] });
    i += 1;
  }
  while (j < b.length) {
    rows.push({ type: 'added', text: b[j] });
    j += 1;
  }
  return rows;
}

export function sectionDiff(base, draft, key) {
  return diffLines(
    JSON.stringify(base?.[key] ?? null, null, 2),
    JSON.stringify(draft?.[key] ?? null, null, 2),
  );
}

export function collapse(rows, padding = 3) {
  const keep = new Array(rows.length).fill(false);
  rows.forEach((row, index) => {
    if (row.type === 'context') return;
    for (let i = Math.max(0, index - padding); i <= Math.min(rows.length - 1, index + padding); i += 1) {
      keep[i] = true;
    }
  });

  const result = [];
  let skipped = 0;
  rows.forEach((row, index) => {
    if (keep[index]) {
      if (skipped > 0) {
        result.push({ type: 'gap', count: skipped });
        skipped = 0;
      }
      result.push(row);
    } else {
      skipped += 1;
    }
  });
  if (skipped > 0) result.push({ type: 'gap', count: skipped });
  return result;
}
