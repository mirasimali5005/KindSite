import { useEffect } from 'react';

export function useInteractiveEffects(): void {
  useEffect(() => {
    // Scroll reveal
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });

    // Mouse cursor trail
    const trails: HTMLDivElement[] = [];
    const maxTrails = 15;

    const handleMouseMove = (e: MouseEvent): void => {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      document.body.appendChild(trail);
      
      trails.push(trail);
      if (trails.length > maxTrails) {
        const oldTrail = trails.shift();
        oldTrail?.remove();
      }

      setTimeout(() => {
        trail.style.opacity = '0';
        setTimeout(() => trail.remove(), 500);
      }, 500);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      observer.disconnect();
      document.removeEventListener('mousemove', handleMouseMove);
      trails.forEach(trail => trail.remove());
    };
  }, []);
}