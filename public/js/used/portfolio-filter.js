'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

// We're bringing in our handy utility function to toggle classes.
import { elementToggleFunc } from './utilities.js';

/* --- Portfolio Filtering and Custom Select Functionality --- */
// This script manages a custom dropdown menu for selecting portfolio categories
// and filters the displayed portfolio items accordingly.

// We grab the main custom select dropdown element.
const select = document.querySelector("[data-select]");
// We get all the individual options within our custom select dropdown.
const selectItems = document.querySelectorAll("[data-select-item]");
// This is where we display the currently selected category.
const selectValue = document.querySelector("[data-selecct-value]");
// These are the filter buttons (e.g., "All", "Web Design").
const filterBtn = document.querySelectorAll("[data-filter-btn]");

// If our custom select dropdown exists, we make it interactive.
if (select) select.addEventListener("click", function () { elementToggleFunc(this); });

// We add a click listener to each option in our custom select dropdown.
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase(); // Get the text of the clicked option.
    if (selectValue) selectValue.innerText = this.innerText; // Update the displayed selected value.
    if (select) elementToggleFunc(select); // Close the dropdown.
    filterFunc(selectedValue); // Apply the filter based on the selected value.
  });
}

// We grab all the individual portfolio items that can be filtered.
const filterItems = document.querySelectorAll("[data-filter-item]");
// This function actually hides or shows portfolio items based on the selected category.
const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    // If "All" is selected, show everything.
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    }
    // If the item's category matches the selected value, show it.
    else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    }
    // Otherwise, hide the item.
    else {
      filterItems[i].classList.remove("active");
    }
  }
};

// We also handle the regular filter buttons (if they exist).
if (filterBtn && filterBtn.length > 0) {
  let lastClickedBtn = filterBtn[0]; // Keep track of the last active filter button.
  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase(); // Get the text of the clicked button.
      if (selectValue) selectValue.innerText = this.innerText; // Update the displayed selected value (for consistency).
      filterFunc(selectedValue); // Apply the filter.

      // Update the 'active' state of the filter buttons.
      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }
}