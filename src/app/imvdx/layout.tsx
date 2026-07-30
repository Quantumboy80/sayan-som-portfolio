'use client';

import { useEffect } from 'react';

export default function ImvdxLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hide global portfolio shell elements
    const selectors = [
      'nav',                           // Navbar
      'footer',                        // Footer
      '#oneko',                        // Cat
      '[data-quote]',                  // Quote
      '[data-now-playing]',            // Now Playing
      '[data-chat-bubble]',            // Chat Bubble
    ];

    const hidden: HTMLElement[] = [];

    selectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        el.style.display = 'none';
        hidden.push(el);
      });
    });

    // Also hide the cat image directly
    const catImg = document.getElementById('oneko');
    if (catImg) {
      catImg.style.display = 'none';
      hidden.push(catImg);
    }

    return () => {
      hidden.forEach((el) => {
        el.style.display = '';
      });
    };
  }, []);

  return <>{children}</>;
}
