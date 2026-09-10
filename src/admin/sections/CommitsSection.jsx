import { emptyCommit, emptyRole } from '../../data/schema.js';
import Field from '../fields/Field.jsx';
import ListEditor from '../fields/ListEditor.jsx';
import StringListEditor from '../fields/StringListEditor.jsx';

export default function CommitsSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <p className="admin-field-hint">
        Cada item é um &quot;commit&quot; da carreira. O hash é gerado sozinho e só serve à
        estética do site.
      </p>
      <ListEditor
        items={value}
        onChange={onChange}
        createItem={emptyCommit}
        addLabel="+ adicionar emprego"
        title={(item, index) => `${item.hash || '·······'} ${item.scope || `emprego ${index + 1}`}`}
      >
        {(commit, updateCommit) => (
          <>
            <Field
              label="Identificador"
              value={commit.id}
              onChange={(next) => updateCommit({ ...commit, id: next })}
              hint="Único entre os empregos. Não aparece no site."
            />
            <Field
              label="Escopo"
              value={commit.scope}
              onChange={(next) => updateCommit({ ...commit, scope: next })}
              hint="O nome que aparece depois do hash. ex.: inside-sistemas"
            />
            <Field
              label="Etiqueta"
              value={commit.tag ?? ''}
              onChange={(next) => updateCommit({ ...commit, tag: next.trim() === '' ? null : next })}
              hint="Deixe vazio para não mostrar etiqueta. ex.: Atual"
            />
            <div className="admin-subsection">
              <span className="admin-field-label">Cargos</span>
              <ListEditor
                items={commit.roles}
                onChange={(next) => updateCommit({ ...commit, roles: next })}
                createItem={emptyRole}
                addLabel="+ adicionar cargo"
                title={(role, index) => role.role || `cargo ${index + 1}`}
              >
                {(role, updateRole) => (
                  <>
                    <Field
                      label="Período"
                      value={role.date}
                      onChange={(next) => updateRole({ ...role, date: next })}
                      hint="ex.: Jul de 2026 — o momento · 1 mês · Toledo, Paraná · Tempo integral"
                    />
                    <Field
                      label="Cargo"
                      value={role.role}
                      onChange={(next) => updateRole({ ...role, role: next })}
                    />
                    <StringListEditor
                      label="Adições (+)"
                      items={role.additions}
                      onChange={(next) => updateRole({ ...role, additions: next })}
                      placeholder="O que você fez nesse cargo"
                    />
                    <StringListEditor
                      label="Remoções (−)"
                      items={role.removals}
                      onChange={(next) => updateRole({ ...role, removals: next })}
                      placeholder="O que deixou de ser necessário"
                    />
                    <StringListEditor
                      label="Stack"
                      items={role.stack}
                      onChange={(next) => updateRole({ ...role, stack: next })}
                    />
                  </>
                )}
              </ListEditor>
            </div>
          </>
        )}
      </ListEditor>
    </div>
  );
}
