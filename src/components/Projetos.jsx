import { projects } from '../data/content.js';
import ProjectCard from './ProjectCard.jsx';

export default function Projetos() {
  return (
    <section id="projetos" className="section">
      <p className="section-label">~/projetos</p>
      <p className="section-hint mono dim">branches shipadas para produção</p>
      <div className="projects">
        {projects.map((project) => (
          <ProjectCard project={project} key={project.id} />
        ))}
      </div>
    </section>
  );
}
