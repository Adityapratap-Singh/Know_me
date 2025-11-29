'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

/* --- Contacts Section: Making Contact Details Expandable --- */
// This script allows users to click or tap on a contact item to see its full details in a pop-up (modal).
// It's designed to work smoothly on both mobile and desktop devices.

// We grab all the contact items on the page.
const contactItems = document.querySelectorAll("[data-contact-item]");

// These variables will help us manage the expanded contact's state.
let expandedContactOverlay = null; // The dimmed background behind the pop-up.
let expandedContactModal = null;   // The actual pop-up window showing the full contact details.
let currentContactSourceItem = null; // Keeps track of which contact was last opened.
let escContactHandler = null;      // Stores the function that closes the pop-up when 'Escape' is pressed.

// This function gracefully closes any currently expanded contact pop-up.
function closeContactExpanded() {
  // If there's a modal open, we hide it and then remove it from the page after a short delay.
  if (expandedContactModal) {
    expandedContactModal.classList.remove('visible');
    setTimeout(() => {
      if (expandedContactModal && expandedContactModal.parentNode) expandedContactModal.parentNode.removeChild(expandedContactModal);
      expandedContactModal = null;
    }, 200);
  }
  // Similarly, if there's an overlay, we hide it and remove it.
  if (expandedContactOverlay) {
    expandedContactOverlay.classList.remove('visible');
    setTimeout(() => {
      if (expandedContactOverlay && expandedContactOverlay.parentNode) expandedContactOverlay.parentNode.removeChild(expandedContactOverlay);
      expandedContactOverlay = null;
    }, 200);
  }
  currentContactSourceItem = null; // Reset the currently expanded item.
  // If we had an Escape key listener, we remove it to clean up.
  if (escContactHandler) {
    document.removeEventListener('keydown', escContactHandler);
    escContactHandler = null;
  }
}

// This function creates and displays the pop-up modal for a given contact item.
function buildExpandedContactModalFrom(item) {
  // We extract the name, message, email, phone, and attachment content from the clicked contact card.
  const name = item.querySelector('[data-contact-name]');
  const message = item.querySelector('[data-contact-message]');
  const email = item.querySelector('[data-contact-email]');
  const phone = item.querySelector('[data-contact-phone]');
  let attachment = item.querySelector('[data-contact-attachment]');

  // First, create the dimmed background overlay.
  expandedContactOverlay = document.createElement('div');
  expandedContactOverlay.className = 'expanded-overlay';
  document.body.appendChild(expandedContactOverlay);
  // Make it visible with a smooth animation.
  requestAnimationFrame(() => expandedContactOverlay.classList.add('visible'));
  // If the user clicks the overlay, close the pop-up.
  expandedContactOverlay.addEventListener('click', () => closeContactExpanded());

  // Next, create the actual contact details pop-up modal.
  expandedContactModal = document.createElement('div');
  expandedContactModal.className = 'expanded-testimonial'; // Reusing a class for consistent styling.

  let attachmentHtml = '';
  // If there's an attachment, we create a link for it.
  if (attachment && attachment.href) {
    let attachmentUrl = attachment.href;
    // We modify the URL to force the browser to download the attachment instead of opening it.
    const parts = attachmentUrl.split('/upload/');
    if (parts.length === 2) {
      attachmentUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
    }
    attachmentHtml = `<p><a href="${attachmentUrl}" target="_blank">View Attachment</a></p>`;
  }

  // Fill the modal with the contact's content, including a close button.
  expandedContactModal.innerHTML = `
    <button class="expanded-close" aria-label="Close Contact">&times;</button>
    <div class="expanded-inner">
      <div class="expanded-header">
        <div class="expanded-title-wrap">
          <h4 class="h3 modal-title expanded-title">${name ? name.innerHTML : ''}</h4>
        </div>
      </div>
      <div class="expanded-body">
        <p><strong>Email:</strong> ${email ? email.innerHTML : ''}</p>
        <p><strong>Phone:</strong> ${phone ? phone.innerHTML : ''}</p>
        <p><strong>Message:</strong></p>
        ${message ? message.innerHTML : ''}
        ${attachmentHtml}
      </div>
    </div>
  `;
  document.body.appendChild(expandedContactModal);
  // Make the modal visible with a smooth animation.
  requestAnimationFrame(() => expandedContactModal.classList.add('visible'));

  // Add event listeners for the close button and to prevent clicks inside the modal from closing it.
  expandedContactModal.querySelector('.expanded-close').addEventListener('click', closeContactExpanded);
  expandedContactModal.addEventListener('click', e => e.stopPropagation());

  // Set up an event listener to close the modal when the 'Escape' key is pressed.
  escContactHandler = function (e) {
    if (e.key === 'Escape') closeContactExpanded();
  };
  document.addEventListener('keydown', escContactHandler);
}

// This is the main function that decides whether to open or close a contact details pop-up.
function toggleContactExpand(item) {
  // If the clicked item is already open, close it.
  if (currentContactSourceItem === item) {
    closeContactExpanded();
    return;
  }
  // Otherwise, close any other open pop-up and then open the new one.
  closeContactExpanded();
  currentContactSourceItem = item;
  buildExpandedContactModalFrom(item);
}

// We go through each contact item to add interactive behavior.
contactItems.forEach(function (item) {
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
      toggleContactExpand(item); // ...then we toggle the contact details expansion.
    }
  });

  // If the pointer interaction is cancelled (e.g., by a browser gesture)...
  item.addEventListener('pointercancel', function () {
    pointerDown = false;
    // Release the pointer capture.
    try { item.releasePointerCapture(pointerId); } catch {}
  });
});