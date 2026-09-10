import { useState } from 'react';

function move(items, from, to) {
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function ListEditor({ items, onChange, createItem, title, addLabel, children }) {
  const list = items ?? [];
  const [collapsed, setCollapsed] = useState(() => new Set());

  function toggle(index) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function update(index, item) {
    const copy = [...list];
    copy[index] = item;
    onChange(copy);
  }

  function remove(index) {
    const rotulo = title(list[index], index);
    if (!window.confirm(`Remover "${rotulo}"? A alteração só vale quando você publicar.`)) return;
    onChange(list.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-list">
      {list.map((item, index) => {
        const isCollapsed = collapsed.has(index);
        return (
          // A posição é a identidade: estes itens não têm id próprio.
          <section className="admin-card" key={index}>
            <header className="admin-card-header">
              <button
                className="admin-card-toggle mono"
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() => toggle(index)}
              >
                <span className="admin-card-chevron">{isCollapsed ? '▸' : '▾'}</span>
                {title(item, index)}
              </button>
              <div className="admin-row-actions">
                <button
                  className="admin-icon-button"
                  type="button"
                  title="subir"
                  disabled={index === 0}
                  onClick={() => onChange(move(list, index, index - 1))}
                >
                  ↑
                </button>
                <button
                  className="admin-icon-button"
                  type="button"
                  title="descer"
                  disabled={index === list.length - 1}
                  onClick={() => onChange(move(list, index, index + 1))}
                >
                  ↓
                </button>
                <button
                  className="admin-icon-button admin-icon-danger"
                  type="button"
                  title="remover"
                  onClick={() => remove(index)}
                >
                  ✕
                </button>
              </div>
            </header>
            {isCollapsed ? null : (
              <div className="admin-card-body">
                {children(item, (next) => update(index, next), index)}
              </div>
            )}
          </section>
        );
      })}
      <button className="admin-button" type="button" onClick={() => onChange([...list, createItem()])}>
        {addLabel}
      </button>
    </div>
  );
}
