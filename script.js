// This file only does something on the Register page (the page with the form).
const form = document.getElementById("registerForm");

if (form) {
  const clearBtn = document.getElementById("clearBtn");
  const confirmation = document.getElementById("confirmation");

  // Simple email pattern: text@text.text (no spaces)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Student ID: letters, numbers, dashes only, 5 to 15 characters
  const idPattern = /^[A-Za-z0-9-]{5,15}$/;

  // Each rule returns an error message, or "" if the value is fine.
  const rules = {
    fullName: (v) => {
      if (v === "") return "Please enter your full name.";
      if (v.length < 2) return "Your name must have at least 2 characters.";
      return "";
    },
    studentId: (v) => {
      if (v === "") return "Please enter your student ID.";
      if (!idPattern.test(v)) return "Use 5 to 15 letters, numbers, or dashes (example: 2026-00123).";
      return "";
    },
    email: (v) => {
      if (v === "") return "Please enter your email address.";
      if (!emailPattern.test(v)) return "Enter a valid email, like juan@example.com.";
      return "";
    },
    course: (v) => (v === "" ? "Please select your course." : ""),
    yearLevel: (v) => (v === "" ? "Please select your year level." : ""),
  };

  // Show an error under a field and mark the field as invalid
  function showError(id, message) {
    document.getElementById(id + "Error").textContent = message;
    const input = document.getElementById(id);
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
  }

  // Remove the error from a field
  function clearError(id) {
    document.getElementById(id + "Error").textContent = "";
    const input = document.getElementById(id);
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
  }

  // Check every field. Returns true only if all are valid.
  function validateForm() {
    let firstInvalidId = null;

    Object.keys(rules).forEach((id) => {
      const value = document.getElementById(id).value.trim();
      const message = rules[id](value);
      if (message) {
        showError(id, message);
        if (firstInvalidId === null) firstInvalidId = id;
      } else {
        clearError(id);
      }
    });

    // Move the cursor to the first problem so the user can fix it right away
    if (firstInvalidId !== null) {
      document.getElementById(firstInvalidId).focus();
      return false;
    }
    return true;
  }

  // The popup (a <dialog> element in register.html)
  const dialog = document.getElementById("confirmDialog");
  const dialogMessage = document.getElementById("confirmMessage");

  // Show the popup with a message. onYes only runs if the user presses the Yes button.
  function askConfirm(message, onYes) {
    dialogMessage.textContent = message;
    dialog.returnValue = ""; // reset, so closing with the Esc key never counts as "yes"
    dialog.addEventListener(
      "close",
      () => {
        if (dialog.returnValue === "yes") onYes();
      },
      { once: true } // run only one time, so listeners don't pile up
    );
    dialog.showModal();
  }

  // What happens after the user says Yes to submitting
  function submitRegistration() {
    // Fill the confirmation area (textContent is safe against injected HTML)
    document.getElementById("outName").textContent = document.getElementById("fullName").value.trim();
    document.getElementById("outId").textContent = document.getElementById("studentId").value.trim();
    document.getElementById("outEmail").textContent = document.getElementById("email").value.trim();
    document.getElementById("outCourse").textContent = document.getElementById("course").value;
    document.getElementById("outYear").textContent = document.getElementById("yearLevel").value;

    confirmation.hidden = false;
    form.reset(); // empty the form so another student can register
    confirmation.focus(); // screen readers and keyboard users land on the message
    confirmation.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // What happens after the user says Yes to clearing
  function clearForm() {
    form.reset();
    Object.keys(rules).forEach(clearError);
    confirmation.hidden = true;
    document.getElementById("fullName").focus();
  }

  // Submit button: check the fields first, then ask in the popup
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // stop the page from reloading
    confirmation.hidden = true;

    if (!validateForm()) return;
    askConfirm("Submit your registration?", submitRegistration);
  });

  // Clear button: ask in the popup first
  clearBtn.addEventListener("click", () => {
    askConfirm("Clear all fields? This cannot be undone.", clearForm);
  });

  // As soon as the user edits a field, remove its error message
  function onEdit(event) {
    if (rules[event.target.id]) clearError(event.target.id);
  }
  form.addEventListener("input", onEdit);
  form.addEventListener("change", onEdit);
}