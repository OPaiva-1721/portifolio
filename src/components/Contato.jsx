import { contact } from '../data/content.js';

export default function Contato() {
  return (
    <section id="contato" className="section section-contato">
      <p className="section-label">~/contato</p>
      <div className="contato-links">
        <a href={`mailto:${contact.email}`} className="contato-item">
          <span className="contato-icon">✉</span>
          <span className="mono">{contact.email}</span>
        </a>
        <a href="#" className="contato-item">
          <span className="contato-icon">⌥</span>
          <span className="mono placeholder-tag">{contact.github}</span>
        </a>
        <a href="#" className="contato-item">
          <span className="contato-icon">☎</span>
          <span className="mono placeholder-tag">{contact.whatsapp}</span>
        </a>
      </div>
    </section>
  );
}
