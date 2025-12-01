'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

// We're bringing in our handy utility function to toggle classes.
import { elementToggleFunc } from './utilities.js';

/* --- Sidebar Functionality --- */

// We grab the main sidebar element using its custom data attribute.
const sidebar = document.querySelector("[data-sidebar]");
// And we also get the button that will control the sidebar.
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// If both the sidebar and its button exist on the page...
if (sidebarBtn && sidebar) {
  // Set initial ARIA attributes
  sidebarBtn.setAttribute('aria-expanded', 'false');
  sidebarBtn.setAttribute('aria-controls', 'sidebar-nav'); // Assuming sidebar has id="sidebar-nav"
  sidebar.setAttribute('id', 'sidebar-nav'); // Ensure sidebar has the ID

  // ...we set up an event listener so that when the button is clicked,
  // our utility function toggles the 'active' class on the sidebar,
  // making it appear or disappear.
  sidebarBtn.addEventListener("click", function () {
    elementToggleFunc(sidebar);
    // Toggle aria-expanded attribute
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!isExpanded));
  });
}

// We also handle the case where the sidebar should close when a navigation link inside it is clicked.
// This is common for single-page applications or when navigating within the same page.
const navLinks = document.querySelectorAll(".navbar-link"); // Assuming these are the navigation links within the sidebar.

for (let i = 0; i < navLinks.length; i++) {
  navLinks[i].addEventListener("click", function () {
    // If the sidebar is currently active (open), close it.
    if (sidebar && sidebar.classList.contains("active")) {
      elementToggleFunc(sidebar);
      // Update aria-expanded when sidebar closes
      if (sidebarBtn) {
        sidebarBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });
}
