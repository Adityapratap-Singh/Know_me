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
  // ...we set up an event listener so that when the button is clicked,
  // our utility function toggles the 'active' class on the sidebar,
  // making it appear or disappear.
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}