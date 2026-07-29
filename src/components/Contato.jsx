import { contact } from '../data/content.js';

const isPlaceholder = (value) => typeof value === 'string' && value.startsWith('[');

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
    <path d="m3 6 9 7 9-7" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.5 0-.24-.01-1.04-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.51-1.11-1.51-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.56-1.13-4.56-5.02 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.04a9.4 9.4 0 0 1 5 0c1.91-1.31 2.75-1.04 2.75-1.04.55 1.41.2 2.45.1 2.71.64.71 1.03 1.62 1.03 2.73 0 3.9-2.34 4.76-4.57 5.01.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.5A10.02 10.02 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.92C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.26-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.55-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.96-.15.17-.29.19-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.7-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.77-1.84-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.47-.01-.17 0-.44.06-.67.31-.23.24-.87.85-.87 2.08 0 1.22.9 2.4 1.02 2.57.13.17 1.77 2.7 4.28 3.79.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.15-1.17-.06-.11-.23-.17-.48-.29Z" />
  </svg>
);

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
      <h2 className="section-label">~/contato</h2>
      <div className="contato-links">
        <a href={`mailto:${contact.email}`} className="contato-item">
          <span className="contato-icon"><EmailIcon /></span>
          <span className="mono">{contact.email}</span>
        </a>
        <ContatoLink href={`https://github.com/${contact.github}`} icon={<GithubIcon />} label={contact.github} />
        <ContatoLink href={contact.whatsapp} icon={<WhatsappIcon />} label={contact.name} />
      </div>
    </section>
  );
}
