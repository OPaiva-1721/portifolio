import { SECTION_LABELS } from '../data/schema.js';

export default function PublishBar({ changed, onReview, busy, result, error, onResolveConflict, onDismiss }) {
  if (result) {
    return (
      <div className="admin-publish-bar is-success" role="status">
        <span className="mono">
          commit {result.commitSha.slice(0, 7)} publicado · o site atualiza em cerca de 1 min
        </span>
        <a className="admin-button" href={result.commitUrl} target="_blank" rel="noopener noreferrer">
          ver no GitHub
        </a>
        <button className="admin-button" type="button" onClick={onDismiss}>
          fechar
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-publish-bar is-error" role="alert">
        <span>{error}</span>
        {onResolveConflict ? (
          <button className="admin-button" type="button" onClick={onResolveConflict}>
            buscar versão atual
          </button>
        ) : null}
        <button className="admin-button" type="button" onClick={onDismiss}>
          fechar
        </button>
      </div>
    );
  }

  if (changed.length === 0) return null;

  return (
    <div className="admin-publish-bar">
      <span className="mono admin-publish-status">
        modificado: {changed.map((key) => SECTION_LABELS[key]).join(', ')}
      </span>
      <button className="admin-button-primary" type="button" onClick={onReview} disabled={busy}>
        commit &amp; publicar
      </button>
    </div>
  );
}
