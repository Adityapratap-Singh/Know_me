'use strict';

const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formFeedback = document.getElementById('form-feedback');

// Function to display an error message for a given input
const displayError = (input, message) => {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid'); // Ensure valid class is removed
  let errorElement = input.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('error-message')) {
    errorElement = document.createElement('span');
    errorElement.classList.add('error-message');
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }
  errorElement.textContent = message;
};

// Function to clear an error message for a given input
const clearError = (input) => {
  input.classList.remove('is-invalid');
  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.remove();
  }
};

// Function to display general form feedback (success/error)
const displayFormFeedback = (message, type) => {
  if (!formFeedback) return;
  formFeedback.textContent = message;
  formFeedback.className = 'form-feedback';
  formFeedback.classList.add(type === 'success' ? 'success-message' : 'error-message');
  formFeedback.style.display = 'block';

  // Optionally hide after a few seconds
  setTimeout(() => {
    if (!formFeedback) return;
    formFeedback.style.display = 'none';
    formFeedback.textContent = '';
  }, 5000);
};

for (let i = 0; i < formInputs.length; i++) {
  let debounceTimer = null;
  formInputs[i].addEventListener("input", function () {
    if (!form || !formBtn) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    const inputEl = this;
    debounceTimer = setTimeout(() => {
      if (inputEl.checkValidity()) {
        clearError(inputEl);
        inputEl.classList.add('is-valid');
      } else {
        inputEl.classList.remove('is-valid');
        if (inputEl.value.trim() !== '' || inputEl.required) {
          displayError(inputEl, inputEl.validationMessage);
        }
      }
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    }, 150);
  });

  formInputs[i].addEventListener("invalid", function (event) {
    event.preventDefault(); // Prevent default browser error message
    displayError(this, this.validationMessage);
    this.classList.remove('is-valid'); // Remove is-valid if invalid
    // Ensure button is disabled if form is invalid
    formBtn.setAttribute("disabled", "");
  });

  formInputs[i].addEventListener("blur", function () {
    if (!this.checkValidity() && this.value.trim() !== '') {
      displayError(this, this.validationMessage);
      this.classList.remove('is-valid'); // Remove is-valid if invalid
    } else if (this.checkValidity()) {
      clearError(this);
      this.classList.add('is-valid'); // Add is-valid class on valid input
    } else {
      this.classList.remove('is-valid'); // Remove is-valid if empty and not valid
    }
  });
}

// Handle form submission (AJAX)
if (form) form.addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevent default form submission
  if (formFeedback) formFeedback.style.display = 'none';

  if (!form.checkValidity()) {
    // If form is invalid, trigger validation messages for all fields
    for (let i = 0; i < formInputs.length; i++) {
      if (!formInputs[i].checkValidity()) {
        displayError(formInputs[i], formInputs[i].validationMessage);
      }
    }
    return;
  }

  formBtn.setAttribute("disabled", ""); // Disable button during submission
  formBtn.textContent = "Sending..."; // Provide feedback to user

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(form.action, {
      method: form.method,
      // IMPORTANT: Do NOT set Content-Type header when sending FormData with files.
      // The browser will automatically set the correct 'multipart/form-data' header.
      body: formData, // Send the FormData object directly
    });

    const result = await response.json();

    if (response.ok) {
      displayFormFeedback('Your response has been shared and saved.', 'success');
      form.reset(); // Clear the form
      for (let i = 0; i < formInputs.length; i++) {
        clearError(formInputs[i]); // Clear any remaining error messages
        formInputs[i].classList.remove('is-valid'); // Remove valid class
      }
      formBtn.setAttribute("disabled", ""); // Keep button disabled after successful submission
      formBtn.textContent = "Send Message";
    } else {
      displayFormFeedback(`Error: ${result.message || 'Something went wrong.'}`, 'error');
      formBtn.removeAttribute("disabled");
      formBtn.textContent = "Send Message";
    }
  } catch (error) {
    console.error('Submission error:', error);
    displayFormFeedback('An unexpected error occurred. Please try again later.', 'error');
    formBtn.removeAttribute("disabled");
    formBtn.textContent = "Send Message";
  }
});
