import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchContent, login, logout } from './api.js';
import LoginScreen from './LoginScreen.jsx';
import useDraft from './useDraft.js';
import BioSection from './sections/BioSection.jsx';
import EducationSection from './sections/EducationSection.jsx';
import CertificationsSection from './sections/CertificationsSection.jsx';
import CommitsSection from './sections/CommitsSection.jsx';
import ContactSection from './sections/ContactSection.jsx';
import ProjectsSection from './sections/ProjectsSection.jsx';
import { SECTION_KEYS, SECTION_LABELS } from '../data/schema.js';
import './admin.css';

export default function AdminApp() {
  const [status, setStatus] = useState('checking');
  const [loginError, setLoginError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [server, setServer] = useState(null);
  const { draft, setSection, changed, discard } = useDraft(server);
  const [active, setActive] = useState('bio');

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
    </div>
  );
}
