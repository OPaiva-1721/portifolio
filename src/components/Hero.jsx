import { useEffect, useRef } from 'react';
import anime from 'animejs';

const NAME = 'Gabryel Paiva Neves';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero() {
  const lettersWrapRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const letters = lettersWrapRef.current.querySelectorAll('.letter');

    if (prefersReducedMotion()) {
      letters.forEach((l) => (l.style.opacity = 1));
      subtitleRef.current.style.opacity = 0.85;
      subtitleRef.current.style.transform = 'none';
      ctaRef.current.style.opacity = 1;
      ctaRef.current.style.transform = 'none';
      return;
    }

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
      );

    timeline.finished.then(() => {
      anime({
        targets: cursorRef.current,
        opacity: [1, 0],
        duration: 500,
        direction: 'alternate',
        loop: true,
        easing: 'steps(1)',
      });
    });
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
          <a href="#" className="btn btn-ghost">
            baixar CV <span className="mono dim">[placeholder-link]</span>
          </a>
        </div>
      </div>
    </section>
  );
}
