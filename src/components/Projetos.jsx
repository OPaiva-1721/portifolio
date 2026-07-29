import { projects } from '../data/content.js';
import ProjectCard from './ProjectCard.jsx';

export default function Projetos() {
  return (
    <section id="projetos" className="section">
      <h2 className="section-label">~/projetos</h2>
      <p className="section-hint mono dim">branches shipadas para produção</p>
      <div className="projects">
        {projects.map((project) => (
          <ProjectCard project={project} key={project.id} />
        ))}
      </div>
    </section>
  );
}
