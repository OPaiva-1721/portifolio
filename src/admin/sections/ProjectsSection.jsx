import { emptyProject } from '../../data/schema.js';
import Field from '../fields/Field.jsx';
import ListEditor from '../fields/ListEditor.jsx';
import StringListEditor from '../fields/StringListEditor.jsx';

export default function ProjectsSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <ListEditor
        items={value}
        onChange={onChange}
        createItem={emptyProject}
        addLabel="+ adicionar projeto"
        title={(item, index) => item.name || `projeto ${index + 1}`}
      >
        {(project, update) => (
          <>
            <Field
              label="Identificador"
              value={project.id}
              onChange={(next) => update({ ...project, id: next })}
              hint="Único entre os projetos. Não aparece no site."
            />
            <Field label="Nome" value={project.name} onChange={(next) => update({ ...project, name: next })} />
            <Field
              label="Arquivo"
              value={project.filename}
              onChange={(next) => update({ ...project, filename: next })}
              hint="O nome de arquivo decorativo do card. ex.: barber-foundation.dart"
            />
            <Field
              label="Descrição"
              value={project.description}
              multiline
              onChange={(next) => update({ ...project, description: next })}
            />
            <StringListEditor
              label="Stack"
              items={project.stack}
              onChange={(next) => update({ ...project, stack: next })}
            />
            <Field
              label="Link"
              value={project.href}
              onChange={(next) => update({ ...project, href: next })}
              hint="Precisa começar com https://"
            />
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={project.showInCv}
                onChange={(event) => update({ ...project, showInCv: event.target.checked })}
              />
              aparece no currículo (/#cv)
            </label>
          </>
        )}
      </ListEditor>
    </div>
  );
}
