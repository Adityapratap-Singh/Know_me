'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

/* --- General Utility Functions --- */

// A simple function to toggle the 'active' class on any given HTML element.
// This is super handy for showing/hiding things or changing their styles dynamically.
export const elementToggleFunc = function (elem) { elem.classList.toggle("active"); };