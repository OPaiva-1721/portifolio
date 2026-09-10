function move(items, from, to) {
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function StringListEditor({ label, items, onChange, placeholder = '' }) {
  const list = items ?? [];

  return (
    <div className="admin-field">
      <span className="admin-field-label">{label}</span>
      <ul className="admin-string-list">
        {list.map((item, index) => (
          // A posição é a identidade aqui: os itens são textos livres, sem id próprio.
          <li className="admin-string-item" key={index}>
            <input
              className="admin-input"
              value={item}
              placeholder={placeholder}
              aria-label={`${label}, item ${index + 1}`}
              onChange={(event) => {
                const copy = [...list];
                copy[index] = event.target.value;
                onChange(copy);
              }}
            />
            <div className="admin-row-actions">
              <button
                className="admin-icon-button"
                type="button"
                title="subir"
                aria-label={`Subir item ${index + 1}`}
                disabled={index === 0}
                onClick={() => onChange(move(list, index, index - 1))}
              >
                ↑
              </button>
              <button
                className="admin-icon-button"
                type="button"
                title="descer"
                aria-label={`Descer item ${index + 1}`}
                disabled={index === list.length - 1}
                onClick={() => onChange(move(list, index, index + 1))}
              >
                ↓
              </button>
              <button
                className="admin-icon-button admin-icon-danger"
                type="button"
                title="remover"
                aria-label={`Remover item ${index + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== index))}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button className="admin-button" type="button" onClick={() => onChange([...list, ''])}>
        + adicionar
      </button>
    </div>
  );
}
