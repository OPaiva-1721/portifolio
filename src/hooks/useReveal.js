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
            anime({
              targets: el,
              opacity: [0, 1],
              translateY: [translateY, 0],
              duration,
              delay,
              easing: 'easeOutQuad',
            });
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
