(function() {
  "use strict";

  const forms = document.querySelectorAll('.php-email-form');

  forms.forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      handleFormSubmission(form);
    });
  });

  function handleFormSubmission(form) {
    const action = form.getAttribute('action');
    const recaptcha = form.getAttribute('data-recaptcha-site-key');
    const loadingElem = form.querySelector('.loading');
    const errorMessageElem = form.querySelector('.error-message');
    const sentMessageElem = form.querySelector('.sent-message');

    if (!action) {
      displayError(form, 'The form action property is not set!');
      return;
    }

    loadingElem.classList.add('d-block');
    errorMessageElem.classList.remove('d-block');
    sentMessageElem.classList.remove('d-block');

    const formData = new FormData(form);

    if (recaptcha) {
      if (typeof grecaptcha !== "undefined") {
        grecaptcha.ready(() => {
          try {
            grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
              .then(token => {
                formData.set('recaptcha-response', token);
                submitFormData(form, action, formData);
              });
          } catch (error) {
            displayError(form, error);
          }
        });
      } else {
        displayError(form, 'The reCaptcha javascript API url is not loaded!');
      }
    } else {
      submitFormData(form, action, formData);
    }
  }

  function submitFormData(form, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error(`${response.status} ${response.statusText} ${response.url}`);
        }
      })
      .then(data => {
        const loadingElem = form.querySelector('.loading');
        const sentMessageElem = form.querySelector('.sent-message');

        loadingElem.classList.remove('d-block');

        if (data.trim() === 'OK') {
          sentMessageElem.classList.add('d-block');
          form.reset();
        } else {
          throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action);
        }
      })
      .catch(error => {
        displayError(form, error);
      });
  }

  function displayError(form, error) {
    const loadingElem = form.querySelector('.loading');
    const errorMessageElem = form.querySelector('.error-message');

    loadingElem.classList.remove('d-block');
    errorMessageElem.innerHTML = error;
    errorMessageElem.classList.add('d-block');
  }

})();
