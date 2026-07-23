import { contact } from '../data/content.js';

const isPlaceholder = (value) => typeof value === 'string' && value.startsWith('[');

function ContatoLink({ href, icon, label }) {
  if (isPlaceholder(label) || !href) {
    return (
      <span className="contato-item">
        <span className="contato-icon">{icon}</span>
        <span className="mono placeholder-tag">{label}</span>
      </span>
    );
  }

  return (
    <a href={href} className="contato-item" target="_blank" rel="noopener noreferrer">
      <span className="contato-icon">{icon}</span>
      <span className="mono">{label}</span>
    </a>
  );
}

export default function Contato() {
  return (
    <section id="contato" className="section section-contato">
      <p className="section-label">~/contato</p>
      <div className="contato-links">
        <a href={`mailto:${contact.email}`} className="contato-item">
          <span className="contato-icon">✉</span>
          <span className="mono">{contact.email}</span>
        </a>
        <ContatoLink href={`https://github.com/${contact.github}`} icon="⌥" label={contact.github} />
        <ContatoLink href={contact.whatsapp} icon="☎" label={contact.whatsapp} />
      </div>
    </section>
  );
}
