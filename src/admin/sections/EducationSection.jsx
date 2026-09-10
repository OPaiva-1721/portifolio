import { emptyEducation } from '../../data/schema.js';
import Field from '../fields/Field.jsx';
import ListEditor from '../fields/ListEditor.jsx';

export default function EducationSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <ListEditor
        items={value}
        onChange={onChange}
        createItem={emptyEducation}
        addLabel="+ adicionar formação"
        title={(item, index) => item.degree || `formação ${index + 1}`}
      >
        {(item, update) => (
          <>
            <Field
              label="Identificador"
              value={item.id}
              onChange={(next) => update({ ...item, id: next })}
              hint="Só letras, números e hífens. Não aparece no site."
            />
            <Field label="Curso" value={item.degree} onChange={(next) => update({ ...item, degree: next })} />
            <Field
              label="Instituição"
              value={item.institution}
              onChange={(next) => update({ ...item, institution: next })}
            />
            <Field
              label="Período"
              value={item.period}
              onChange={(next) => update({ ...item, period: next })}
              hint="ex.: 2023 — previsão 2027 · Toledo, Paraná"
            />
            <Field
              label="Descrição"
              value={item.description}
              multiline
              onChange={(next) => update({ ...item, description: next })}
            />
          </>
        )}
      </ListEditor>
    </div>
  );
}
