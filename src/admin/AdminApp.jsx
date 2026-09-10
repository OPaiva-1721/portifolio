import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchContent, login, logout } from './api.js';
import LoginScreen from './LoginScreen.jsx';
import './admin.css';

export default function AdminApp() {
  const [status, setStatus] = useState('checking');
  const [loginError, setLoginError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [server, setServer] = useState(null);

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

  return (
    <div className="admin">
      <header className="admin-header">
        <span className="mono admin-brand">~/admin</span>
        <button className="admin-button" type="button" onClick={handleLogout}>
          sair
        </button>
      </header>
      <main className="admin-main">
        {loadError ? (
          <div className="admin-error" role="alert">
            <p>{loadError}</p>
            <button className="admin-button" type="button" onClick={load}>
              tentar de novo
            </button>
          </div>
        ) : (
          <p className="mono dim">
            conteúdo carregado: {Object.keys(server?.content ?? {}).length} seções
          </p>
        )}
      </main>
    </div>
  );
}
