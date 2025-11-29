'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

/* --- Testimonials Section: Making Testimonials Expandable --- */
// This script allows users to click or tap on a testimonial card to see its full content in a pop-up (modal).
// It's designed to work smoothly on both mobile and desktop devices.

// We grab all the testimonial items on the page.
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");

// These variables will help us manage the expanded testimonial's state.
let expandedOverlay = null; // The dimmed background behind the pop-up.
let expandedModal = null;   // The actual pop-up window showing the full testimonial.
let currentSourceItem = null; // Keeps track of which testimonial was last opened.
let escHandler = null;      // Stores the function that closes the pop-up when 'Escape' is pressed.

// This function gracefully closes any currently expanded testimonial pop-up.
function closeExpanded() {
  // If there's a modal open, we hide it and then remove it from the page after a short delay.
  if (expandedModal) {
    expandedModal.classList.remove('visible');
    setTimeout(() => {
      if (expandedModal && expandedModal.parentNode) expandedModal.parentNode.removeChild(expandedModal);
      expandedModal = null;
    }, 200);
  }
  // Similarly, if there's an overlay, we hide it and remove it.
  if (expandedOverlay) {
    expandedOverlay.classList.remove('visible');
    setTimeout(() => {
      if (expandedOverlay && expandedOverlay.parentNode) expandedOverlay.parentNode.removeChild(expandedOverlay);
      expandedOverlay = null;
    }, 200);
  }
  currentSourceItem = null; // Reset the currently expanded item.
  // If we had an Escape key listener, we remove it to clean up.
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
}

// This function creates and displays the pop-up modal for a given testimonial item.
function buildExpandedModalFrom(item) {
  // We extract the avatar, title, and text content from the clicked testimonial card.
  const avatar = item.querySelector('[data-testimonials-avatar]');
  const title = item.querySelector('[data-testimonials-title]');
  const text = item.querySelector('[data-testimonials-text]');

  // First, create the dimmed background overlay.
  expandedOverlay = document.createElement('div');
  expandedOverlay.className = 'expanded-overlay';
  document.body.appendChild(expandedOverlay);
  // Make it visible with a smooth animation.
  requestAnimationFrame(() => expandedOverlay.classList.add('visible'));
  // If the user clicks the overlay, close the pop-up.
  expandedOverlay.addEventListener('click', () => closeExpanded());

  // Next, create the actual testimonial pop-up modal.
  expandedModal = document.createElement('div');
  expandedModal.className = 'expanded-testimonial'; // Reusing a class for consistent styling.
  // Fill the modal with the testimonial's content, including a close button.
  expandedModal.innerHTML = `
    <button class="expanded-close" aria-label="Close testimonial">&times;</button>
    <div class="expanded-inner">
      <div class="expanded-header">
        <div class="modal-avatar-box expanded-avatar-box">
          ${avatar ? `<img src="${avatar.src}" alt="${avatar.alt || ''}" loading="lazy">` : ''}
        </div>
        <div class="expanded-title-wrap">
          <h4 class="h3 modal-title expanded-title">${title ? title.innerHTML : ''}</h4>
        </div>
      </div>
      <div class="expanded-body">
        ${text ? text.innerHTML : ''}
      </div>
    </div>
  `;
  document.body.appendChild(expandedModal);
  // Make the modal visible with a smooth animation.
  requestAnimationFrame(() => expandedModal.classList.add('visible'));

  // Add event listeners for the close button and to prevent clicks inside the modal from closing it.
  expandedModal.querySelector('.expanded-close').addEventListener('click', closeExpanded);
  expandedModal.addEventListener('click', e => e.stopPropagation());

  // Set up an event listener to close the modal when the 'Escape' key is pressed.
  escHandler = function (e) {
    if (e.key === 'Escape') closeExpanded();
  };
  document.addEventListener('keydown', escHandler);
}

// This is the main function that decides whether to open or close a testimonial pop-up.
function toggleExpand(item) {
  // If the clicked item is already open, close it.
  if (currentSourceItem === item) {
    closeExpanded();
    return;
  }
  // Otherwise, close any other open pop-up and then open the new one.
  closeExpanded();
  currentSourceItem = item;
  buildExpandedModalFrom(item);
}

// We go through each testimonial item to add interactive behavior.
testimonialsItem.forEach(function (item) {
  let pointerDown = false; // Tracks if a pointer (mouse/finger) is currently down.
  let startX = 0;          // Starting X position of the pointer.
  let startY = 0;          // Starting Y position of the pointer.
  let pointerId = null;    // Unique ID for the pointer event.

  // When a pointer goes down on an item...
  item.addEventListener('pointerdown', function (e) {
    pointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
    pointerId = e.pointerId;
    // We "capture" the pointer to ensure we get all subsequent events for this interaction.
    try { item.setPointerCapture(pointerId); } catch {}
  });

  // When a pointer is lifted from an item...
  item.addEventListener('pointerup', function (e) {
    if (!pointerDown) return; // If pointer wasn't down, ignore.
    pointerDown = false;
    // Release the pointer capture.
    try { item.releasePointerCapture(pointerId); } catch {}
    // Calculate how much the pointer moved.
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    // If the movement was very small (i.e., it was a tap/click, not a drag/swipe)...
    if (dx < 10 && dy < 10) {
      toggleExpand(item); // ...then we toggle the testimonial expansion.
    }
  });

  // If the pointer interaction is cancelled (e.g., by a browser gesture)...
  item.addEventListener('pointercancel', function () {
    pointerDown = false;
    // Release the pointer capture.
    try { item.releasePointerCapture(pointerId); } catch {}
  });
});