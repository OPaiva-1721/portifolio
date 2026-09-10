import Field from '../fields/Field.jsx';

export default function ContactSection({ value, onChange }) {
  function set(key, next) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="admin-section">
      <Field label="Nome" value={value.name} onChange={(next) => set('name', next)} />
      <Field label="E-mail" value={value.email} type="email" onChange={(next) => set('email', next)} />
      <Field
        label="GitHub"
        value={value.github}
        onChange={(next) => set('github', next)}
        hint="Só o usuário, sem a URL. ex.: OPaiva-1721"
      />
      <Field
        label="WhatsApp"
        value={value.whatsapp}
        onChange={(next) => set('whatsapp', next)}
        hint="Link completo. ex.: https://wa.me/554498727549"
      />
    </div>
  );
}
