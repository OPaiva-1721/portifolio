import { useRef, useState } from 'react';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LINKS = [
  { href: '#sobre', label: '~/sobre' },
  { href: '#experiencia', label: '~/experiencia' },
  { href: '#projetos', label: '~/projetos' },
  { href: '#contato', label: '~/contato' },
];

export default function Nav() {
  const navRef = useRef(null);
  const rafRef = useRef(null);
  const [open, setOpen] = useState(false);

  // spotlight especular que segue o mouse (--mx/--my lidos pelo ::before no CSS)
  const handleMouseMove = (e) => {
    if (prefersReducedMotion()) return;
    if (rafRef.current) return;
    const { clientX, clientY } = e;
    rafRef.current = requestAnimationFrame(() => {
      const rect = navRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      navRef.current.style.setProperty('--mx', `${x}%`);
      navRef.current.style.setProperty('--my', `${y}%`);
      rafRef.current = null;
    });
  };

  return (
    <nav className="tabbar" ref={navRef} onMouseMove={handleMouseMove} aria-label="Navegação principal">
      <div className="tabbar-inner">
        <a href="#hero" className="tabbar-brand" onClick={() => setOpen(false)}>
          gabryel<span className="dim">.dev</span>
        </a>

        <div className="tabbar-links">
          {LINKS.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <button
          className="tabbar-toggle"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`tabbar-toggle-bar${open ? ' open' : ''}`} />
        </button>
      </div>

      <div className={`tabbar-mobile${open ? ' open' : ''}`}>
        {LINKS.map((link) => (
          <a href={link.href} key={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
