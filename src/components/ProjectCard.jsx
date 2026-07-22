import { useRef } from 'react';
import anime from 'animejs';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// mesmo brilho de vidro do CSS (.project-card) — precisa ser repetido aqui
// porque a animação de hover escreve boxShadow inline, e um inline style
// sempre vence a regra do CSS.
const GLASS_SHADOW = '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)';
const GLASS_SHADOW_HOVER = '0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)';

export default function ProjectCard({ project }) {
  const cardRef = useRef(null);
  const dotRef = useRef(null);
  const rafRef = useRef(null);

  // spotlight especular que segue o mouse (--mx/--my lidos pelo ::before no CSS)
  const handleMouseMove = (e) => {
    if (prefersReducedMotion()) return;
    if (rafRef.current) return;
    const { clientX, clientY } = e;
    rafRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      cardRef.current.style.setProperty('--mx', `${x}%`);
      cardRef.current.style.setProperty('--my', `${y}%`);
      rafRef.current = null;
    });
  };

  const handleEnter = () => {
    if (prefersReducedMotion()) return;
    anime({
      targets: cardRef.current,
      translateY: -6,
      boxShadow: GLASS_SHADOW_HOVER,
      duration: 250,
      easing: 'easeOutQuad',
    });
    anime({
      targets: dotRef.current,
      backgroundColor: '#7EE2B8',
      scale: 1.2,
      duration: 250,
      easing: 'easeOutQuad',
    });
  };

  const handleLeave = () => {
    if (prefersReducedMotion()) return;
    anime({
      targets: cardRef.current,
      translateY: 0,
      boxShadow: GLASS_SHADOW,
      duration: 250,
      easing: 'easeOutQuad',
    });
    anime({
      targets: dotRef.current,
      backgroundColor: '#2A3138',
      scale: 1,
      duration: 250,
      easing: 'easeOutQuad',
    });
  };

  return (
    <a
      href={project.href}
      className="project-card"
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMouseMove}
    >
      <div className="project-tabbar">
        <span className="project-dot" ref={dotRef}></span>
        <span className="project-filename mono">{project.filename}</span>
      </div>
      <div className="project-body">
        <h3 className="placeholder-tag">{project.name}</h3>
        <p>{project.description}</p>
        <div className="tags">
          {project.stack.map((item) => (
            <span className="tag" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
