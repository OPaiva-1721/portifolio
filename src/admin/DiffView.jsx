import { SECTION_LABELS } from '../data/schema.js';
import { collapse, sectionDiff } from './diff.js';

const PREFIX = { added: '+', removed: '-', context: ' ' };

export default function DiffView({ base, draft, sections }) {
  return (
    <div className="admin-diff">
      {sections.map((key) => {
        const rows = collapse(sectionDiff(base, draft, key));
        return (
          <section className="admin-diff-section" key={key}>
            <h3 className="mono admin-diff-title">~/{SECTION_LABELS[key]}</h3>
            <pre className="admin-diff-body">
              {rows.map((row, index) =>
                row.type === 'gap' ? (
                  // A posição é a identidade: estes itens não têm id próprio.
                  <span className="admin-diff-gap" key={index}>
                    {`  … ${row.count} linhas sem alteração\n`}
                  </span>
                ) : (
                  // A posição é a identidade: estes itens não têm id próprio.
                  <span className={`admin-diff-line is-${row.type}`} key={index}>
                    {`${PREFIX[row.type]} ${row.text}\n`}
                  </span>
                ),
              )}
            </pre>
          </section>
        );
      })}
    </div>
  );
}
