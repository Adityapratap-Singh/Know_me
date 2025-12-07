'use strict';

const projectItems = document.querySelectorAll('[data-project-item]');

let expandedOverlay = null;
let expandedModal = null;
let currentItem = null;
let escHandler = null;

function closeExpanded() {
  if (expandedModal) {
    expandedModal.classList.remove('visible');
    setTimeout(() => {
      if (expandedModal && expandedModal.parentNode) expandedModal.parentNode.removeChild(expandedModal);
      expandedModal = null;
    }, 200);
  }
  if (expandedOverlay) {
    expandedOverlay.classList.remove('visible');
    setTimeout(() => {
      if (expandedOverlay && expandedOverlay.parentNode) expandedOverlay.parentNode.removeChild(expandedOverlay);
      expandedOverlay = null;
    }, 200);
  }
  currentItem = null;
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
}

function buildModalFrom(item) {
  const title = item.querySelector('[data-project-title]');
  const category = item.querySelector('[data-project-category]');
  const image = item.querySelector('[data-project-image]');
  const description = item.querySelector('[data-project-description]');
  const context = item.querySelector('[data-project-context]');
  const role = item.querySelector('[data-project-role]');
  const approach = item.querySelector('[data-project-approach]');
  const outcome = item.querySelector('[data-project-outcome]');
  const tech = item.querySelector('[data-project-technologies]');
  const strengths = item.querySelector('[data-project-strengths]');
  const link = item.querySelector('[data-project-link]');

  expandedOverlay = document.createElement('div');
  expandedOverlay.className = 'expanded-overlay';
  document.body.appendChild(expandedOverlay);
  requestAnimationFrame(() => expandedOverlay.classList.add('visible'));
  expandedOverlay.addEventListener('click', () => closeExpanded());

  expandedModal = document.createElement('div');
  expandedModal.className = 'expanded-testimonial';

  const techList = (tech && tech.textContent ? tech.textContent.split(',').map(s => s.trim()).filter(Boolean) : []);
  const strengthsList = (strengths && strengths.textContent ? strengths.textContent.split(',').map(s => s.trim()).filter(Boolean) : []);
  const chip = (label, tone) => `<li style=\"background:${tone};color:var(--white-2);padding:.3rem .6rem;border-radius:8px;font-size:.8rem;\">${label}</li>`;
  const techHtml = techList.length ? `<div style="margin-top:.75rem"><strong>Tech Stack:</strong><ul style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.25rem;">${techList.map(t => chip(t,'var(--jet)')).join('')}</ul></div>` : '';
  const strengthsHtml = strengthsList.length ? `<div style="margin-top:.75rem"><strong>Strengths:</strong><ul style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.25rem;">${strengthsList.map(s => chip(s,'#2a2a2a')).join('')}</ul></div>` : '';
  const imgHtml = (image && image.textContent) ? `<div class="modal-avatar-box" style="width:100%;height:auto;border-radius:12px;overflow:hidden;margin-bottom:12px;"><img src="${image.textContent}" alt="${title ? title.textContent : ''}" style="width:100%;height:auto;object-fit:cover;"></div>` : '';
  const visitHtml = (link && link.textContent) ? `<div style="margin-top:14px;display:flex;justify-content:flex-end;"><a href="${link.textContent}" target="_blank" rel="noopener" class="form-btn" style="background:var(--blue-ryb);padding:.6rem 1rem;border-radius:8px;">View Project</a></div>` : '';

  const typeHtml = (category && category.textContent) ? `<div style="margin-top:.5rem"><strong>Type:</strong> ${category.textContent}</div>` : '';
  const descHtml = (description && description.textContent) ? `<div style="margin-top:.5rem"><strong>Description:</strong> ${description.textContent}</div>` : '';
  const contextHtml = (context && context.textContent) ? `<div style="margin-top:.5rem"><strong>Context:</strong> ${context.textContent}</div>` : '';
  const roleHtml = (role && role.textContent) ? `<div style="margin-top:.5rem"><strong>Role:</strong> ${role.textContent}</div>` : '';
  const approachHtml = (approach && approach.textContent) ? `<div style="margin-top:.5rem"><strong>Approach:</strong> ${approach.textContent}</div>` : '';
  const outcomeHtml = (outcome && outcome.textContent) ? `<div style="margin-top:.5rem"><strong>Outcome:</strong> ${outcome.textContent}</div>` : '';
  const summaryHtml = `${typeHtml}${descHtml}${contextHtml}${roleHtml}${approachHtml}${outcomeHtml}`;

  expandedModal.innerHTML = `
    <button class="expanded-close" aria-label="Close">&times;</button>
    <div class="expanded-inner">
      <div class="expanded-header">
        <div class="expanded-title-wrap">
          <h4 class="h3 modal-title expanded-title">${title ? title.textContent : ''}</h4>
          <p class="project-category">${category ? category.textContent : ''}</p>
        </div>
      </div>
      <div class="expanded-body">
        ${imgHtml}
        ${summaryHtml}
        ${strengthsHtml}
        ${techHtml}
        ${visitHtml}
      </div>
    </div>
  `;
  document.body.appendChild(expandedModal);
  requestAnimationFrame(() => expandedModal.classList.add('visible'));

  expandedModal.querySelector('.expanded-close').addEventListener('click', closeExpanded);
  expandedModal.addEventListener('click', e => e.stopPropagation());

  escHandler = function (e) { if (e.key === 'Escape') closeExpanded(); };
  document.addEventListener('keydown', escHandler);
}

function toggleExpand(item) {
  if (currentItem === item) {
    closeExpanded();
    return;
  }
  closeExpanded();
  currentItem = item;
  buildModalFrom(item);
}

projectItems.forEach(function (item) {
  const anchor = item.querySelector('a');
  if (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      toggleExpand(item);
    });
  }

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
