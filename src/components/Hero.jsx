import { useEffect, useRef } from 'react';
import anime from 'animejs';
import TerminalPrompt from './TerminalPrompt.jsx';

const NAME = 'Gabryel Paiva Neves';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero() {
  const lettersWrapRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const cursorRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    const letters = lettersWrapRef.current.querySelectorAll('.letter');

    // Garante que nome, subtítulo e CTAs fiquem visíveis mesmo se o anime.js
    // falhar em runtime — sem isso, o hero fica permanentemente invisível
    // (o CSS parte de opacity:0 pra evitar flash antes da animação).
    const revealWithoutAnimation = () => {
      letters.forEach((l) => (l.style.opacity = 1));
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = 0.85;
        subtitleRef.current.style.transform = 'none';
      }
      if (ctaRef.current) {
        ctaRef.current.style.opacity = 1;
        ctaRef.current.style.transform = 'none';
      }
      if (terminalRef.current) {
        terminalRef.current.style.opacity = 1;
        terminalRef.current.style.transform = 'none';
      }
    };

    if (prefersReducedMotion()) {
      revealWithoutAnimation();
      return;
    }

    try {
      const timeline = anime.timeline({ easing: 'easeOutExpo' });

      timeline
        .add({
          targets: letters,
          opacity: [0, 1],
          duration: 1,
          delay: anime.stagger(65),
        })
        .add(
          {
            targets: subtitleRef.current,
            opacity: [0, 0.85],
            translateY: [6, 0],
            duration: 600,
          },
          '+=100'
        )
        .add(
          {
            targets: ctaRef.current,
            opacity: [0, 1],
            translateY: [6, 0],
            duration: 600,
          },
          '-=400'
        )
        .add(
          {
            targets: terminalRef.current,
            opacity: [0, 1],
            translateY: [6, 0],
            duration: 600,
          },
          '-=300'
        );

      timeline.finished
        .then(() => {
          anime({
            targets: cursorRef.current,
            opacity: [1, 0],
            duration: 500,
            direction: 'alternate',
            loop: true,
            easing: 'steps(1)',
          });
        })
        .catch(revealWithoutAnimation);
    } catch {
      revealWithoutAnimation();
    }
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="hero-inner">
        <p className="hero-eyebrow">$ whoami</p>
        <h1 className="hero-name">
          <span ref={lettersWrapRef}>
            {NAME.split('').map((char, i) => (
              <span className="letter" key={i}>
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </span>
          <span className="cursor" ref={cursorRef} aria-hidden="true">
            _
          </span>
        </h1>
        <p className="hero-subtitle" ref={subtitleRef}>
          Desenvolvedor de Software — leio problemas reais como diffs e entrego mudanças
          versionadas.
        </p>
        <div className="hero-cta" ref={ctaRef}>
          <a href="#experiencia" className="btn btn-primary">
            → ver o changelog
          </a>
          <a href="/#cv" className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            baixar CV
          </a>
        </div>
        <div className="hero-terminal" ref={terminalRef}>
          <TerminalPrompt />
        </div>
      </div>
    </section>
  );
}
