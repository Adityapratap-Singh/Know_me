
'use strict';

/**
 * Handles page transitions by intercepting link clicks,
 * playing an exit animation, and then navigating.
 */

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.navbar-link');
  const activeArticle = document.querySelector('article.active');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetHref = this.getAttribute('href');
      
      // Ignore if opening in new tab or external link
      if (this.target === '_blank' || targetHref.startsWith('http')) return;

      // Ignore if clicking the current page link
      if (targetHref === window.location.pathname) return;

      e.preventDefault();

      if (activeArticle) {
        // Add exit class to trigger animation
        activeArticle.classList.add('exit');
        activeArticle.classList.remove('active'); // Optional: depending on CSS, keeping active might be needed for display:block

        // Wait for animation to finish (500ms matches CSS)
        setTimeout(() => {
          window.location.href = targetHref;
        }, 500);
      } else {
        // If no active article found, just navigate immediately
        window.location.href = targetHref;
      }
    });
  });
});
