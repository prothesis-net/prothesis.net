/* waitlist.js — sends the ask chapter's form to the waitlist Worker and answers in place. Without JavaScript the form
   posts by itself and the Worker answers with its own page. Words marked DRAFT are for Albert to approve. */
(function () {
  var form = document.querySelector('form.join');
  if (!form || !window.fetch) return;
  var t0 = Date.now(), msg = document.querySelector('.join-msg'), button = form.querySelector('button');
  var SAY = {   // DRAFT
    email: 'That doesn’t look like an email address. Please check it.',
    busy: 'Too many tries just now. Please wait a few minutes and try again.',
    other: 'Something went wrong. Please try again, or write to contact@prothesis.net.',
    thanks: 'Thank you. Please check your inbox and confirm your email.',
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = { email: form.email.value, website: form.website.value, t: Date.now() - t0 };
    msg.textContent = ''; msg.classList.remove('is-error'); button.disabled = true;
    fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (r) {
        if (r.ok) {
          var done = document.createElement('p');
          done.className = 'join-done'; done.setAttribute('role', 'status'); done.tabIndex = -1; done.textContent = SAY.thanks;
          form.replaceWith(done); msg.remove(); done.focus();
          return;
        }
        throw new Error(r.error || 'other');
      })
      .catch(function (err) {
        button.disabled = false; msg.classList.add('is-error');
        msg.textContent = SAY[err.message] || SAY.other;
        if (err.message === 'email') form.email.focus();
      });
  });
})();
