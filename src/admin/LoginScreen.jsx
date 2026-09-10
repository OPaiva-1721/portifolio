import { useState } from 'react';

export default function LoginScreen({ onSubmit, error, busy }) {
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (password !== '') onSubmit(password);
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p className="admin-login-prompt mono">
          <span className="admin-login-dollar">$</span> sudo edit portfolio
        </p>
        <label className="admin-login-label" htmlFor="admin-password">
          senha
        </label>
        <input
          id="admin-password"
          className="admin-input mono"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
        {error ? (
          <p className="admin-login-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="admin-button-primary" type="submit" disabled={busy || password === ''}>
          {busy ? 'entrando…' : 'entrar'}
        </button>
      </form>
    </div>
  );
}
