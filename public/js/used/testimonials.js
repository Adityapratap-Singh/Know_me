'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

/* --- Testimonials Section: Making Testimonials Expandable --- */
// This script allows users to click or tap on a testimonial card to see its full content in a pop-up (modal).
// It's designed to work smoothly on both mobile and desktop devices.

let testimonialsItem = [];

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
  isPaused = false;
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
  isPaused = true;
  buildExpandedModalFrom(item);
}

// We go through each testimonial item to add interactive behavior.
function attachItemEvents() {
  testimonialsItem.forEach(function (item) {
    let pointerDown = false;
    let startX = 0;
    let startY = 0;
    let pointerId = null;

    item.addEventListener('pointerdown', function (e) {
      pointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
      pointerId = e.pointerId;
      try { item.setPointerCapture(pointerId); } catch {}
    });

    item.addEventListener('pointerup', function (e) {
      if (!pointerDown) return;
      pointerDown = false;
      try { item.releasePointerCapture(pointerId); } catch {}
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx < 10 && dy < 10) {
        toggleExpand(item);
      }
    });

    item.addEventListener('pointercancel', function () {
      pointerDown = false;
      try { item.releasePointerCapture(pointerId); } catch {}
    });
  });
}

const list = document.querySelector('article[data-page="about"] .testimonials .testimonials-list');
const bar = document.querySelector('.testimonial-progress-bar');
let isPaused = false;
let autoRaf = null;
let scrollSpeed = 0.4;
let track = null;
let offsetX = 0;

function setupInfinite() {
  if (!list) return;
  if (!track) {
    const children = Array.from(list.children);
    if (children.length === 0) return;
    track = document.createElement('div');
    track.className = 'testimonial-track';
    track.style.display = 'flex';
    track.style.alignItems = 'stretch';
    track.style.gap = getComputedStyle(list).gap || '24px';
    track.style.willChange = 'transform';
    // move existing children into track
    children.forEach(ch => track.appendChild(ch));
    // limited clones to ensure seamless loop
    const maxClones = Math.min(8, children.length);
    for (let i = 0; i < maxClones; i++) {
      track.appendChild(children[i].cloneNode(true));
    }
    list.innerHTML = '';
    list.appendChild(track);
    list.style.scrollSnapType = 'none';
    list.style.overflowX = 'hidden';
    list.style.position = 'relative';
  }
  testimonialsItem = list.querySelectorAll('[data-testimonials-item]');
  attachItemEvents();
}
function updateProgress() {
  if (!track || !bar) return;
  const total = track.scrollWidth || track.getBoundingClientRect().width;
  const pct = total > 0 ? ((offsetX % total) / total) * 100 : 0;
  bar.style.width = pct + '%';
}
if (list) {
  list.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  requestAnimationFrame(updateProgress);
}

const items = document.querySelectorAll('.testimonials-item');
const cards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.querySelector('.testimonial-nav.prev');
const nextBtn = document.querySelector('.testimonial-nav.next');

function closestIndex() {
  if (!list || items.length === 0) return 0;
  const center = list.clientWidth / 2;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const rect = el.getBoundingClientRect();
    const elCenter = rect.left + rect.width / 2 - list.getBoundingClientRect().left;
    const dist = Math.abs(elCenter - center);
    if (dist < bestDist) { bestDist = dist; best = i; }
  }
  return best;
}

function markCenter() {
  const idx = closestIndex();
  for (let i = 0; i < items.length; i++) {
    if (i === idx) items[i].classList.add('is-center'); else items[i].classList.remove('is-center');
  }
}

function snapTo(index) {
  if (index < 0) index = 0;
  if (index > items.length - 1) index = items.length - 1;
  const el = items[index];
  if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

if (list) {
  let raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; markCenter(); });
  }
  list.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', markCenter);
  requestAnimationFrame(markCenter);
}

if (prevBtn) prevBtn.addEventListener('click', () => { const i = closestIndex(); snapTo(i - 1); });
if (nextBtn) nextBtn.addEventListener('click', () => { const i = closestIndex(); snapTo(i + 1); });

function tick() {
  if (!track) return;
  if (!isPaused) {
    offsetX += scrollSpeed;
    const cs = getComputedStyle(list);
    const gap = parseFloat(cs.gap) || 0;
    const first = track.firstElementChild;
    if (first) {
      const wrapWidth = first.offsetWidth + gap;
      if (offsetX >= wrapWidth) {
        track.appendChild(first);
        offsetX -= wrapWidth;
      }
    }
    track.style.transform = `translateX(${-offsetX}px)`;
    updateProgress();
  }
  autoRaf = requestAnimationFrame(tick);
}

if (list) {
  setupInfinite();
  requestAnimationFrame(tick);
}
