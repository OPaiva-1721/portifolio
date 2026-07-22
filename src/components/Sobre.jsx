import { bio } from '../data/content.js';

export default function Sobre() {
  return (
    <section id="sobre" className="section">
      <p className="section-label">~/sobre</p>
      <div className="section-body">
        <p className="bio">
          <span className="placeholder-tag">{bio.placeholder}</span> {bio.example}
        </p>
        <div className="stack">
          <span className="stack-label mono dim">stack —</span>
          {bio.stack.map((item) => (
            <span
              className={`tag${item.startsWith('[') ? ' placeholder-tag' : ''}`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
