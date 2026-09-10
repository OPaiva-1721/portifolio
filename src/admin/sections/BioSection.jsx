import Field from '../fields/Field.jsx';
import StringListEditor from '../fields/StringListEditor.jsx';

export default function BioSection({ value, onChange }) {
  function set(key, next) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="admin-section">
      <Field
        label="Tagline"
        value={value.tagline}
        onChange={(next) => set('tagline', next)}
        hint="A frase que abre a seção Sobre."
      />
      <Field label="Texto" value={value.text} multiline onChange={(next) => set('text', next)} />
      <StringListEditor
        label="Stack"
        items={value.stack}
        onChange={(next) => set('stack', next)}
        placeholder="ex.: TypeScript"
      />
      <StringListEditor
        label="Soft skills"
        items={value.softSkills}
        onChange={(next) => set('softSkills', next)}
      />
    </div>
  );
}
