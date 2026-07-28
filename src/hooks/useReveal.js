import { useEffect, useRef } from 'react';
import anime from 'animejs';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Anima um elemento (fade + slide) na primeira vez que ele entra na viewport.
export default function useReveal({ translateY = 16, duration = 600, delay = 0 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = 1;
      el.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              anime({
                targets: el,
                opacity: [0, 1],
                translateY: [translateY, 0],
                duration,
                delay,
                easing: 'easeOutQuad',
              });
            } catch {
              // se o anime.js falhar em runtime, garante que o elemento
              // não fique preso em opacity:0 (mesmo fallback do Hero.jsx)
              el.style.opacity = 1;
              el.style.transform = 'none';
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [translateY, duration, delay]);

  return ref;
}
