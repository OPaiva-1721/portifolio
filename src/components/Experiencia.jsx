import { commits } from '../data/content.js';
import Commit from './Commit.jsx';

export default function Experiencia() {
  return (
    <section id="experiencia" className="section">
      <h2 className="section-label">~/experiencia</h2>
      <p className="section-hint mono dim">
        git log --reverse=false --author="Gabryel Paiva Neves"
      </p>
      <div className="changelog">
        {commits.map((commit) => (
          <Commit commit={commit} key={commit.id} />
        ))}
      </div>
    </section>
  );
}
