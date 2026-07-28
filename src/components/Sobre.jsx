import { bio } from '../data/content.js';

export default function Sobre() {
  return (
    <section id="sobre" className="section">
      <p className="section-label">~/sobre</p>
      <div className="section-body">
        <p className="bio">{bio.text}</p>
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
        <div className="stack">
          <span className="stack-label mono dim">soft skills —</span>
          {bio.softSkills.map((item) => (
            <span className="tag" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
