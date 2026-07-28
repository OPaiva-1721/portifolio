import { Component } from 'react';
import { contact } from '../data/content.js';

// Evita que um erro de render em uma seção (ex: dado malformado em
// content.js) derrube a página inteira para uma tela em branco.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro ao renderizar o portfólio:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <p className="mono dim">$ status: algo quebrou ao renderizar esta seção.</p>
          <p>
            Enquanto eu conserto, me chama direto:{' '}
            <a href={`mailto:${contact.email}`} className="mono">
              {contact.email}
            </a>{' '}
            ·{' '}
            <a
              href={`https://github.com/${contact.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
            >
              github.com/{contact.github}
            </a>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
