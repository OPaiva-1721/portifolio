import useReveal from '../hooks/useReveal.js';

export default function Commit({ commit }) {
  const ref = useReveal({ translateY: 16, duration: 600 });

  return (
    <article className="commit" ref={ref}>
      <div className="commit-meta mono">
        <span className="hash">{commit.hash}</span>
        <span className="date dim">{commit.date}</span>
        {commit.tag === 'HEAD' && <span className="head-tag">HEAD</span>}
        {commit.tag === 'root-commit' && <span className="root-tag">root-commit</span>}
      </div>
      <h3 className="commit-msg">
        <span className="commit-scope">feat({commit.scope}):</span>
        <span className="commit-role">{commit.role}</span>
      </h3>
      <div className="diff">
        {commit.additions.map((line) => (
          <p className="diff-add" key={line}>
            + {line}
          </p>
        ))}
        {commit.removals.map((line) => (
          <p className="diff-rem" key={line}>
            - {line}
          </p>
        ))}
      </div>
      <div className="tags">
        {commit.stack.map((item) => (
          <span
            className={`tag${item.startsWith('[') ? ' placeholder-tag' : ''}`}
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
