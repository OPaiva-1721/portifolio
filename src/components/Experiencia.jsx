import { commits } from '../data/content.js';
import Commit from './Commit.jsx';

export default function Experiencia() {
  return (
    <section id="experiencia" className="section">
      <p className="section-label">~/experiencia</p>
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
