'use strict';

const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formFeedback = document.getElementById('form-feedback'); // Get the feedback container

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
  formFeedback.textContent = message;
  formFeedback.className = 'form-feedback'; // Reset classes
  formFeedback.classList.add(type === 'success' ? 'success-message' : 'error-message');
  formFeedback.style.display = 'block'; // Show the feedback container

  // Optionally hide after a few seconds
  setTimeout(() => {
    formFeedback.style.display = 'none';
    formFeedback.textContent = '';
  }, 5000);
};

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    if (!form || !formBtn) return;

    if (this.checkValidity()) {
      clearError(this);
      this.classList.add('is-valid'); // Add is-valid class on valid input
    } else {
      this.classList.remove('is-valid'); // Remove is-valid if invalid
      // Only display error on input if it's already been marked invalid by a 'blur' or 'invalid' event
      // or if it's a required field that's empty.
      if (this.value.trim() !== '' || this.required) {
        displayError(this, this.validationMessage);
      }
    }
    
    // Check overall form validity to enable/disable button
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });

  formInputs[i].addEventListener("invalid", function (event) {
    event.preventDefault(); // Prevent default browser error message
    displayError(this, this.validationMessage);
    this.classList.remove('is-valid'); // Remove is-valid if invalid
    // Ensure button is disabled if form is invalid
    if (!form.checkValidity()) {
      formBtn.setAttribute("disabled", "");
    }
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
form.addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevent default form submission
  formFeedback.style.display = 'none'; // Hide previous feedback

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      displayFormFeedback('Message sent successfully!', 'success');
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