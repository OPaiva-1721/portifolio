import { bio, commits, projects, contact } from '../data/content.js';

export default function Curriculo() {
  return (
    <div className="cv-page">
      <div className="cv-toolbar">
        <button className="cv-print-btn" onClick={() => window.print()}>
          imprimir / salvar PDF
        </button>
        <a href="/" className="cv-back-link">
          ← voltar ao site
        </a>
      </div>

      <main className="cv-sheet">
        <header className="cv-head">
          <h1>Gabryel Paiva Neves</h1>
          <p className="cv-title">Desenvolvedor de Software</p>
        </header>

        <div className="cv-body">
          <aside className="cv-sidebar">
            <section className="cv-section">
              <h2>Contato</h2>
              <div className="cv-contacts">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                <a href={`https://github.com/${contact.github}`} target="_blank" rel="noopener noreferrer">
                  github.com/{contact.github}
                </a>
                <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                  {contact.name}
                </a>
              </div>
            </section>

            <section className="cv-section">
              <h2>Resumo</h2>
              <p className="cv-bio">{bio.text}</p>
            </section>

            <section className="cv-section">
              <h2>Stack</h2>
              <div className="cv-tags">
                {bio.stack.map((item) => (
                  <span className="cv-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </aside>

          <div className="cv-main">
            <section className="cv-section">
              <h2>Experiência</h2>
              {commits.map((commit) => (
                <div className="cv-entry" key={commit.id}>
                  {commit.roles.map((role, i) => (
                    <div className="cv-role" key={`${commit.id}-${i}`}>
                      <div className="cv-entry-head">
                        <span>
                          <span className="cv-entry-scope">{commit.scope}</span>{' '}
                          <span className="cv-entry-role">{role.role}</span>
                        </span>
                        <span className="cv-entry-date">{role.date}</span>
                      </div>
                      <ul>
                        {role.additions.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                      <div className="cv-tags">
                        {role.stack.map((item) => (
                          <span className="cv-tag" key={item}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>

            <section className="cv-section">
              <h2>Projetos</h2>
              <div className="cv-projects">
                {projects.map((project) => (
                  <div className="cv-project" key={project.id}>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <a href={project.href} target="_blank" rel="noopener noreferrer">
                      {project.href.replace('https://', '')}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="cv-foot">gerado a partir do portfólio — {contact.email}</footer>
      </main>
    </div>
  );
}
