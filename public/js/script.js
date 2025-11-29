'use strict';

/* -------------------------
   Utilities
-------------------------*/
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); };

/* -------------------------
   Sidebar
-------------------------*/
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}

/* -------------------------
   Testimonials - Expand on click/tap (works on mobile & desktop)
-------------------------*/
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");

let expandedOverlay = null;
let expandedModal = null;
let currentSourceItem = null;
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
  currentSourceItem = null;
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
}

function buildExpandedModalFrom(item) {
  const avatar = item.querySelector('[data-testimonials-avatar]');
  const title = item.querySelector('[data-testimonials-title]');
  const text = item.querySelector('[data-testimonials-text]');

  // overlay
  expandedOverlay = document.createElement('div');
  expandedOverlay.className = 'expanded-overlay';
  document.body.appendChild(expandedOverlay);
  requestAnimationFrame(() => expandedOverlay.classList.add('visible'));
  expandedOverlay.addEventListener('click', () => closeExpanded());

  // modal
  expandedModal = document.createElement('div');
  expandedModal.className = 'expanded-testimonial';
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
  requestAnimationFrame(() => expandedModal.classList.add('visible'));

  expandedModal.querySelector('.expanded-close').addEventListener('click', closeExpanded);
  expandedModal.addEventListener('click', e => e.stopPropagation());

  escHandler = function (e) {
    if (e.key === 'Escape') closeExpanded();
  };
  document.addEventListener('keydown', escHandler);
}

function toggleExpand(item) {
  if (currentSourceItem === item) {
    closeExpanded();
    return;
  }
  closeExpanded();
  currentSourceItem = item;
  buildExpandedModalFrom(item);
}

// tap detection to avoid swipe misfires
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

/* -------------------------
   Custom select
-------------------------*/
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) select.addEventListener("click", function () { elementToggleFunc(this); });

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    if (select) elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

const filterItems = document.querySelectorAll("[data-filter-item]");
const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

if (filterBtn && filterBtn.length > 0) {
  let lastClickedBtn = filterBtn[0];
  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }
}

/* -------------------------
   Contact form
-------------------------*/
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    if (!form || !formBtn) return;
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}