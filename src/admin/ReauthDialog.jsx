import { useState } from 'react';

export default function ReauthDialog({ onSubmit, onCancel, busy, error }) {
  const [password, setPassword] = useState('');

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reauth-title">
      <form
        className="admin-modal"
        onSubmit={(event) => {
          event.preventDefault();
          if (password !== '') onSubmit(password);
        }}
      >
        <h2 className="mono admin-modal-title" id="reauth-title">
          sessão expirada
        </h2>
        <p className="admin-field-hint">
          Seu rascunho continua salvo. Entre de novo e a publicação segue do ponto em que parou.
        </p>
        <input
          className="admin-input mono"
          type="password"
          autoComplete="current-password"
          autoFocus
          aria-label="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
        {error ? (
          <p className="admin-login-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-modal-actions">
          <button className="admin-button" type="button" onClick={onCancel} disabled={busy}>
            cancelar
          </button>
          <button className="admin-button-primary" type="submit" disabled={busy || password === ''}>
            {busy ? 'entrando…' : 'entrar e publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
