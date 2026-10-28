"use strict";

const BOOKING_ENDPOINT = "https://script.google.com/macros/s/AKfycbzhFTLnWtyBfpvWOAE4BA42P34vkigq50eY5UOpBCFr7vVqo8UfebkX_8Ez0MUuG73L/exec";

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#site-nav");
  const form = document.querySelector("#booking-form");
  const status = document.querySelector("#form-status");
  const submitButton = document.querySelector("#submit-button");
  const dateInput = document.querySelector("#wedding-date");
  const packageSelect = document.querySelector("#package");
  const currentYear = document.querySelector("#current-year");
  const formFields = {
    partnerOne: document.querySelector("#partner-one"),
    email: document.querySelector("#email"),
    phone: document.querySelector("#phone"),
    weddingDate: dateInput,
    package: packageSelect,
    consent: document.querySelector("#consent")
  };

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  if (dateInput) {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    dateInput.min = localToday;
  }

  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  document.querySelectorAll(".package-select").forEach((button) => {
    button.addEventListener("click", () => {
      if (packageSelect) packageSelect.value = button.dataset.package;
      document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => packageSelect?.focus({ preventScroll: true }), 450);
    });
  });

  const clearError = (field) => {
    const error = document.querySelector(`#${field.id}-error`);
    field.removeAttribute("aria-invalid");
    if (error) error.textContent = "";
  };

  const setError = (field, message) => {
    const error = document.querySelector(`#${field.id}-error`);
    field.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  };

  Object.values(formFields).forEach((field) => {
    field.addEventListener(field.type === "checkbox" ? "change" : "input", () => clearError(field));
  });

  const validateForm = () => {
    let firstInvalidField = null;
    const setValidationError = (field, message) => {
      setError(field, message);
      if (!firstInvalidField) firstInvalidField = field;
    };

    Object.values(formFields).forEach(clearError);
    if (!formFields.partnerOne.value.trim()) setValidationError(formFields.partnerOne, "Please enter your name.");
    if (!formFields.email.value.trim()) {
      setValidationError(formFields.email, "Please enter your email address.");
    } else if (!formFields.email.validity.valid) {
      setValidationError(formFields.email, "Enter a valid email address.");
    }
    if (!formFields.phone.value.trim()) setValidationError(formFields.phone, "Please enter a phone or WhatsApp number.");
    if (!formFields.weddingDate.value) {
      setValidationError(formFields.weddingDate, "Please choose your wedding date.");
    } else if (formFields.weddingDate.value < formFields.weddingDate.min) {
      setValidationError(formFields.weddingDate, "Choose today or a future date.");
    }
    if (!formFields.package.value) setValidationError(formFields.package, "Please choose a package or select “Not sure yet”.");
    if (!formFields.consent.checked) setValidationError(formFields.consent, "Please agree before sending your enquiry.");

    if (firstInvalidField) firstInvalidField.focus();
    return !firstInvalidField;
  };

  const getFormData = () => {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries());
  };

  const setStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const submitToAppsScript = (payload) => new Promise((resolve, reject) => {
    const requestToken = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement("iframe");
    const requestForm = document.createElement("form");
    const timeoutId = window.setTimeout(() => finish(new Error("The booking service did not respond. Please try again later.")), 30000);

    frame.name = `booking-response-${requestToken}`;
    frame.title = "Booking form response";
    frame.hidden = true;
    requestForm.action = BOOKING_ENDPOINT;
    requestForm.method = "post";
    requestForm.target = frame.name;
    requestForm.hidden = true;

    Object.entries({ ...payload, requestToken }).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      requestForm.append(input);
    });

    const onMessage = (event) => {
      if (!/^https:\/\/([a-z0-9-]+-)?script\.googleusercontent\.com$/i.test(event.origin)) return;
      if (!event.data || event.data.type !== "ever-after-booking" || event.data.requestToken !== requestToken) return;
      if (event.data.success) finish(null, event.data);
      else finish(new Error(event.data.message || "The booking service could not save your enquiry."));
    };

    const finish = (error, result) => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      requestForm.remove();
      frame.remove();
      if (error) reject(error);
      else resolve(result);
    };

    window.addEventListener("message", onMessage);
    document.body.append(frame, requestForm);
    requestForm.submit();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setStatus("Please check the highlighted fields.", "error");
      return;
    }

    if (submitButton.disabled) return;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = "Sending your enquiry…";
    setStatus("", "info");

    try {
      const result = await submitToAppsScript(getFormData());
      if (!result || result.success !== true) throw new Error("The enquiry could not be confirmed. Please try again later.");
      setStatus(
        /notification failed/i.test(result.message || "")
          ? result.message
          : "Thank you! Your enquiry has been received. We'll be in touch soon.",
        "success"
      );
      form.reset();
      dateInput.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    } catch (error) {
      setStatus("Sorry, something went wrong. Please try again later.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.textContent = "Send your enquiry ↗";
    }
  });
});
