import { useId } from 'react';

export default function Field({ label, value, onChange, multiline = false, hint, type = 'text' }) {
  const id = useId();
  const Tag = multiline ? 'textarea' : 'input';

  return (
    <div className="admin-field">
      <label className="admin-field-label" htmlFor={id}>
        {label}
      </label>
      <Tag
        id={id}
        className={multiline ? 'admin-textarea' : 'admin-input'}
        type={multiline ? undefined : type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="admin-field-hint">{hint}</p> : null}
    </div>
  );
}
