import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchContent, login, logout, publish } from './api.js';
import LoginScreen from './LoginScreen.jsx';
import useDraft from './useDraft.js';
import BioSection from './sections/BioSection.jsx';
import EducationSection from './sections/EducationSection.jsx';
import CertificationsSection from './sections/CertificationsSection.jsx';
import CommitsSection from './sections/CommitsSection.jsx';
import ContactSection from './sections/ContactSection.jsx';
import ProjectsSection from './sections/ProjectsSection.jsx';
import DiffView from './DiffView.jsx';
import PublishBar from './PublishBar.jsx';
import ReauthDialog from './ReauthDialog.jsx';
import { commitMessage } from './diff.js';
import { SECTION_KEYS, SECTION_LABELS, validateContent } from '../data/schema.js';
import './admin.css';

export default function AdminApp() {
  const [status, setStatus] = useState('checking');
  const [loginError, setLoginError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [server, setServer] = useState(null);
  const { draft, setSection, changed, discard } = useDraft(server);
  const [active, setActive] = useState('bio');
  const [reviewing, setReviewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishResult, setPublishResult] = useState(null);
  const [reauth, setReauth] = useState(false);
  const [reauthError, setReauthError] = useState(null);

  const load = useCallback(async () => {
    try {
      const { content, sha } = await fetchContent();
      setServer({ content, sha });
      setLoadError(null);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'unauthenticated') {
        setStatus('anonymous');
        return;
      }
      setLoadError(error.message);
      setStatus('authenticated');
    }
  }, []);

  useEffect(() => {
    // Busca o status da sessão ao montar. Padrão de "fetch on mount" via
    // useCallback + effect, documentado pelo próprio React como uso válido
    // de efeito (sincronizar com um sistema externo, a API do painel).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleLogin(password) {
    setBusy(true);
    setLoginError(null);
    try {
      await login(password);
      setStatus('checking');
      await load();
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await logout().catch(() => {});
    setServer(null);
    setStatus('anonymous');
  }

  async function doPublish() {
    const validation = validateContent(draft);
    if (!validation.ok) {
      setPublishError(`Corrija antes de publicar — ${validation.errors[0]}`);
      setReviewing(false);
      return;
    }

    setPublishing(true);
    setPublishError(null);
    try {
      const result = await publish({
        content: draft,
        sha: server.sha,
        message: commitMessage(changed),
      });
      setPublishResult(result);
      setReviewing(false);
      setReauth(false);
      // Recarrega do servidor para obter o sha novo; isso também zera o rascunho,
      // porque useDraft descarta o guardado quando o sha muda.
      await load();
    } catch (error) {
      if (error.code === 'unauthenticated') {
        setReauth(true);
      } else if (error.code === 'conflict') {
        setPublishError(
          'O conteúdo mudou no repositório desde que o painel carregou. Recarregue para ver a versão atual — seu rascunho continua salvo neste navegador.',
        );
        setReviewing(false);
      } else {
        setPublishError(error.message);
        setReviewing(false);
      }
    } finally {
      setPublishing(false);
    }
  }

  async function handleReauth(password) {
    setReauthError(null);
    setPublishing(true);
    try {
      await login(password);
      setReauth(false);
      setPublishing(false);
      await doPublish();
    } catch (error) {
      setReauthError(error.message);
      setPublishing(false);
    }
  }

  if (status === 'checking') {
    return <div className="admin-loading mono">carregando…</div>;
  }

  if (status === 'anonymous') {
    return <LoginScreen onSubmit={handleLogin} error={loginError} busy={busy} />;
  }

  function renderSection() {
    if (active === 'bio') {
      return <BioSection value={draft.bio} onChange={(next) => setSection('bio', next)} />;
    }
    if (active === 'education') {
      return <EducationSection value={draft.education} onChange={(next) => setSection('education', next)} />;
    }
    if (active === 'certifications') {
      return (
        <CertificationsSection
          value={draft.certifications}
          onChange={(next) => setSection('certifications', next)}
        />
      );
    }
    if (active === 'commits') {
      return <CommitsSection value={draft.commits} onChange={(next) => setSection('commits', next)} />;
    }
    if (active === 'projects') {
      return <ProjectsSection value={draft.projects} onChange={(next) => setSection('projects', next)} />;
    }
    if (active === 'contact') {
      return <ContactSection value={draft.contact} onChange={(next) => setSection('contact', next)} />;
    }
    return null;
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <span className="mono admin-brand">~/admin</span>
        <button className="admin-button" type="button" onClick={discard} disabled={changed.length === 0}>
          descartar
        </button>
        <button className="admin-button" type="button" onClick={handleLogout}>
          sair
        </button>
      </header>
      <div className="admin-body">
        <nav className="admin-nav" aria-label="Seções do conteúdo">
          {SECTION_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`admin-nav-item mono ${active === key ? 'is-active' : ''}`}
              aria-current={active === key ? 'true' : undefined}
              onClick={() => setActive(key)}
            >
              ~/{SECTION_LABELS[key]}
              {changed.includes(key) ? <span className="admin-nav-dot" title="modificado" /> : null}
            </button>
          ))}
        </nav>
        <main className="admin-main">
          {loadError ? (
            <div className="admin-error" role="alert">
              <p>{loadError}</p>
              <button className="admin-button" type="button" onClick={load}>
                tentar de novo
              </button>
            </div>
          ) : null}
          {draft === null ? <p className="mono dim">carregando conteúdo…</p> : renderSection()}
        </main>
      </div>

      {reviewing && draft ? (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="review-title">
          <div className="admin-modal admin-modal-wide">
            <h2 className="mono admin-modal-title" id="review-title">
              {commitMessage(changed)}
            </h2>
            <DiffView base={server.content} draft={draft} sections={changed} />
            <div className="admin-modal-actions">
              <button className="admin-button" type="button" onClick={() => setReviewing(false)}>
                voltar
              </button>
              <button
                className="admin-button-primary"
                type="button"
                onClick={doPublish}
                disabled={publishing}
              >
                {publishing ? 'publicando…' : 'confirmar e publicar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reauth ? (
        <ReauthDialog
          onSubmit={handleReauth}
          onCancel={() => setReauth(false)}
          busy={publishing}
          error={reauthError}
        />
      ) : null}

      <PublishBar
        changed={changed}
        onReview={() => setReviewing(true)}
        busy={publishing}
        result={publishResult}
        error={publishError}
        onDismiss={() => {
          setPublishResult(null);
          setPublishError(null);
        }}
      />
    </div>
  );
}
