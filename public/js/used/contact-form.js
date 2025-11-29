'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

/* --- Contact Form Functionality --- */
// This script handles the interactive behavior of the contact form,
// specifically enabling or disabling the submit button based on form validity.

// We grab the main contact form element.
const form = document.querySelector("[data-form]");
// We get all the input fields within the contact form.
const formInputs = document.querySelectorAll("[data-form-input]");
// We get the submit button for the contact form.
const formBtn = document.querySelector("[data-form-btn]");

// We loop through each input field in the form.
for (let i = 0; i < formInputs.length; i++) {
  // For each input, we listen for any changes (like typing).
  formInputs[i].addEventListener("input", function () {
    // If for some reason the form or button isn't found, we stop here.
    if (!form || !formBtn) return;
    // We check if all the form's required fields are filled out correctly.
    if (form.checkValidity()) {
      // If the form is valid, we enable the submit button.
      formBtn.removeAttribute("disabled");
    } else {
      // If the form is not valid, we disable the submit button.
      formBtn.setAttribute("disabled", "");
    }
  });
}