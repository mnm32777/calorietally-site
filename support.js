// The support form on support.html. Lives here, not inline, so the site's
// Content-Security-Policy (_headers) can allow only scripts from this
// origin. Posts JSON to the AteRight API; nothing else runs on the page.
(function () {
  var form = document.getElementById('fb');
  var kind = 'bug';
  var copy = {
    bug: { label: 'What happened?', hint: 'What you did, what happened, and what you expected. Your phone model and the app version (Settings, at the bottom) help too.', ph: 'I tapped Look up on "2 eggs and toast" and...', ok: 'Thanks! Your bug report is on its way to the AteRight team.' },
    idea: { label: 'What would make AteRight better?', hint: 'Big or small, every idea gets read. Tell us what you would like and why it would help.', ph: 'It would be great if...', ok: 'Thanks! Your idea is on its way to the AteRight team.' }
  };
  var msg = document.getElementById('msg');
  var status = document.getElementById('status');
  var send = document.getElementById('send');

  function setKind(k) {
    kind = k;
    form.querySelectorAll('.seg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.kind === k));
    });
    document.getElementById('msg-label').textContent = copy[k].label;
    document.getElementById('msg-hint').textContent = copy[k].hint;
    msg.placeholder = copy[k].ph;
    status.textContent = '';
  }
  form.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () { setKind(b.dataset.kind); });
  });
  if (location.hash === '#idea') setKind('idea');

  function say(text, ok) {
    status.textContent = text;
    status.className = 'status ' + (ok ? 'ok' : 'err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var message = msg.value.trim();
    var email = document.getElementById('email').value.trim();
    if (message.length < 10) { say('Tell us a little more first.', false); msg.focus(); return; }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say('That email address does not look right.', false); return; }
    send.disabled = true;
    say('Sending...', true);
    fetch('https://api.ateright.com/v1/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind: kind,
        source: 'web',
        message: message,
        email: email,
        website: document.getElementById('website').value,
        platform: 'web',
        osVersion: navigator.userAgent.slice(0, 120)
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      say(copy[kind].ok, true);
      msg.value = '';
    }).catch(function () {
      say('Could not send right now. Please try again in a minute, or email admin@cardrama.gg.', false);
    }).finally(function () {
      send.disabled = false;
    });
  });
})();
