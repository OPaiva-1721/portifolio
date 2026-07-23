import useReveal from '../hooks/useReveal.js';

export default function Commit({ commit }) {
  const ref = useReveal({ translateY: 16, duration: 600 });

  return (
    <article className="commit" ref={ref}>
      <div className="commit-meta mono">
        <span className="hash">{commit.hash}</span>
        {commit.tag === 'root-commit' ? (
          <span className="root-tag">root-commit</span>
        ) : (
          commit.tag && <span className="head-tag">{commit.tag}</span>
        )}
      </div>

      {commit.roles.map((role, i) => (
        <div className="role-entry" key={`${commit.id}-${i}`}>
          <p className="role-date mono dim">{role.date}</p>
          <h3 className="commit-msg">
            <span className="commit-scope">feat({commit.scope}):</span>
            <span className="commit-role">{role.role}</span>
          </h3>
          <div className="diff">
            {role.additions.map((line) => (
              <p className="diff-add" key={line}>
                + {line}
              </p>
            ))}
            {role.removals.map((line) => (
              <p className="diff-rem" key={line}>
                - {line}
              </p>
            ))}
          </div>
          <div className="tags">
            {role.stack.map((item) => (
              <span
                className={`tag${item.startsWith('[') ? ' placeholder-tag' : ''}`}
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </article>
  );
}
