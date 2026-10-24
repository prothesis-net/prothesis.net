/* Prothesis waitlist — a Cloudflare Worker.
   prothesis.net's form posts here. Sign-ups are stored in Cloudflare D1 and confirmed by email (double opt-in): the
   confirmation is sent from contact@prothesis.net through Microsoft Graph, so it leaves from Albert's own Microsoft 365
   mailbox. Every email carries an unsubscribe link (one click). Albert exports the list, and sends the "it's ready"
   email, with two admin calls; the announcement goes out in small batches each minute (Exchange Online allows a mailbox
   30 messages a minute and 10,000 recipients a day).

   Routes
     POST /subscribe            the form (JSON from the page's script, or a plain form post without JavaScript)
     GET  /confirm?t=…          the link in the confirmation email: shows one button (mail scanners open links)
     POST /confirm?t=…          the button: confirms
     GET  /unsubscribe?t=…      shows one button (mail scanners follow links; only the button unsubscribes)
     POST /unsubscribe?t=…      the button, or a mail app's one-click unsubscribe (RFC 8058)
     GET  /admin/export         CSV of everyone, with consent dates           (Authorization: Bearer ADMIN_TOKEN)
     GET  /admin/stats          counts                                         (Authorization: Bearer ADMIN_TOKEN)
     POST /admin/announce       queue an email to every confirmed subscriber  (Authorization: Bearer ADMIN_TOKEN)
     GET  /admin/mail-log       MAIL_MODE=log only: what would have been sent  (Authorization: Bearer ADMIN_TOKEN)
   scheduled (every minute)     sends the next batch of a queued announcement

   Settings (wrangler.toml [vars]): SITE_ORIGIN, PUBLIC_URL, SENDER, SENDER_NAME, POSTAL_ADDRESS, TENANT_ID, CLIENT_ID,
   MAIL_MODE ("graph" to send, "log" to only record). Secrets (wrangler secret put): CLIENT_SECRET, ADMIN_TOKEN, IP_SALT.

   Every visible word below marked DRAFT is for Albert to approve. */

const CONSENT_TEXT = "Leave your email & we’ll let you know when it’s ready. We’ll only write to you about this phone app. Unsubscribe any time.";
const BATCH = 25;               // per minute; Exchange Online allows 30 messages a minute per mailbox
const MAX_TRIES_PER_HOUR = 5;   // sign-up attempts from one address per hour
const RESEND_AFTER_MIN = 10;    // a second sign-up with the same email re-sends the confirmation after this long

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (request.method === 'OPTIONS') return cors(env, new Response(null, { status: 204 }));
      if (url.pathname === '/subscribe' && request.method === 'POST') return await subscribe(request, env);
      if (url.pathname === '/confirm') return await confirm(request, url, env);
      if (url.pathname === '/unsubscribe') return await unsubscribe(request, url, env);
      if (url.pathname.startsWith('/admin/')) return await admin(request, url, env);
      return new Response('Not found', { status: 404 });
    } catch (e) {
      console.error(e && e.stack || e);
      return wantsJSON(request) ? cors(env, json({ ok: false, error: 'server' }, 500)) : page(env, 500, DRAFT.oops);
    }
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(sendBatch(env)); },
};

/* ---------- words (DRAFT: for Albert to approve) ---------- */
const DRAFT = {
  thanks: 'Thank you. Please check your inbox and confirm your email.',
  confirmed: 'Thank you. You’re on the list. We’ll write when our first app is ready.',
  alreadyGone: 'This link has already been used, or has expired.',
  unsubAsk: 'Stop all emails from Prothesis about this phone app?',
  unsubButton: 'Unsubscribe',
  unsubDone: 'You’re unsubscribed. We won’t write again.',
  oops: 'Something went wrong. Please try again, or write to contact@prothesis.net.',
  back: 'Back to prothesis.net',
  confirmSubject: 'Please confirm your email for Prothesis',
  confirmIntro: 'You asked us to let you know when our first app is ready. Please confirm your email:',
  confirmButton: 'Confirm my email',
  confirmAsk: 'One last step: confirm that you’d like to hear when our first app is ready.',
  confirmIgnore: 'If this wasn’t you, ignore this email and we won’t write again.',
  footer: 'You’re receiving this because you joined the waitlist at prothesis.net.',
  unsubLink: 'Unsubscribe',
};

/* ---------- sign-up ---------- */
async function subscribe(request, env) {
  const asJSON = wantsJSON(request);
  const form = await readBody(request);
  const reply = (body, status = 200) => asJSON ? cors(env, json(body, status)) : page(env, status, body.ok ? DRAFT.thanks : DRAFT.oops);

  // Bots: a hidden field people never see, and a form sent faster than anyone types. Either way, answer as if fine.
  if ((form.website || '').trim() !== '') return reply({ ok: true });
  const openedMs = Number(form.t || 0);
  if (openedMs && openedMs < 2500) return reply({ ok: true });

  const email = String(form.email || '').trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email) || email.length > 254) return reply({ ok: false, error: 'email' }, 400);

  if (!(await allowAttempt(request, env))) return reply({ ok: false, error: 'busy' }, 429);

  const now = new Date().toISOString();
  const row = await env.DB.prepare('SELECT * FROM subscribers WHERE email = ?').bind(email).first();
  let token;
  if (!row) {
    token = randomToken();
    await env.DB.prepare(`INSERT INTO subscribers (email, status, confirm_token, unsub_token, consent_text, created_at)
      VALUES (?, 'pending', ?, ?, ?, ?)`).bind(email, token, randomToken(), CONSENT_TEXT, now).run();
  } else if (row.status === 'confirmed') {
    return reply({ ok: true });                       // already on the list: say the same thing, send nothing
  } else if (row.status === 'pending' && row.confirm_sent_at && minutesSince(row.confirm_sent_at) < RESEND_AFTER_MIN) {
    return reply({ ok: true });                       // a confirmation went out moments ago
  } else {                                            // pending (resend) or unsubscribed (a fresh consent)
    token = randomToken();
    await env.DB.prepare(`UPDATE subscribers SET status = 'pending', confirm_token = ?, consent_text = ?, created_at = ?,
      unsubscribed_at = NULL WHERE id = ?`).bind(token, CONSENT_TEXT, now, row.id).run();
  }
  const link = `${env.PUBLIC_URL}/confirm?t=${token}`;
  await sendMail(env, {
    to: email,
    subject: DRAFT.confirmSubject,
    text: `${DRAFT.confirmIntro}\n\n${link}\n\n${DRAFT.confirmIgnore}\n\n${env.SENDER_NAME}\n${env.POSTAL_ADDRESS}\n${env.SENDER}`,
    html: emailHTML(env, `<p>${DRAFT.confirmIntro}</p>
      <p style="margin:28px 0"><a href="${link}" style="display:inline-block;padding:16px 28px;background:#D6BA6B;color:#101B23;font-weight:700;text-decoration:none">${DRAFT.confirmButton}</a></p>
      <p style="color:#526C7C">${DRAFT.confirmIgnore}</p>`, null),
  });
  await env.DB.prepare('UPDATE subscribers SET confirm_sent_at = ? WHERE email = ?').bind(now, email).run();
  return reply({ ok: true });
}

// Mail scanners (Outlook's Safe Links and others) open every link in an email, so the link alone must not confirm:
// it shows a button, and only pressing it does.
async function confirm(request, url, env) {
  const t = url.searchParams.get('t') || '';
  const row = t && await env.DB.prepare("SELECT id, status FROM subscribers WHERE confirm_token = ?").bind(t).first();
  if (!row || row.status === 'unsubscribed') return page(env, 410, DRAFT.alreadyGone);
  if (request.method !== 'POST' && row.status !== 'confirmed') {
    return page(env, 200, DRAFT.confirmAsk, `<form method="post" action="${env.PUBLIC_URL}/confirm?t=${encodeURIComponent(t)}">
      <button class="btn" type="submit">${DRAFT.confirmButton}</button></form>`);
  }
  if (row.status !== 'confirmed') {
    await env.DB.prepare("UPDATE subscribers SET status = 'confirmed', confirmed_at = ? WHERE id = ?").bind(new Date().toISOString(), row.id).run();
  }
  return page(env, 200, DRAFT.confirmed);
}

async function unsubscribe(request, url, env) {
  const t = url.searchParams.get('t') || (request.method === 'POST' ? (await readBody(request)).t : '') || '';
  const row = t && await env.DB.prepare('SELECT id, status FROM subscribers WHERE unsub_token = ?').bind(t).first();
  if (!row) return page(env, 410, DRAFT.alreadyGone);
  if (request.method !== 'POST') {
    return page(env, 200, DRAFT.unsubAsk, `<form method="post" action="${env.PUBLIC_URL}/unsubscribe?t=${encodeURIComponent(t)}">
      <button class="btn" type="submit">${DRAFT.unsubButton}</button></form>`);
  }
  if (row.status !== 'unsubscribed') {
    await env.DB.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ? WHERE id = ?").bind(new Date().toISOString(), row.id).run();
  }
  return page(env, 200, DRAFT.unsubDone);
}

/* ---------- admin ---------- */
async function admin(request, url, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) return new Response('Unauthorized', { status: 401 });
  if (url.pathname === '/admin/export') {
    const { results } = await env.DB.prepare('SELECT email, status, created_at, confirmed_at, unsubscribed_at, consent_text FROM subscribers ORDER BY id').all();
    const csv = ['email,status,signed_up,confirmed,unsubscribed,consent_text']
      .concat(results.map(r => [r.email, r.status, r.created_at, r.confirmed_at || '', r.unsubscribed_at || '', r.consent_text].map(csvCell).join(','))).join('\r\n');
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="prothesis-waitlist.csv"' } });
  }
  if (url.pathname === '/admin/stats') {
    const { results } = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM subscribers GROUP BY status').all();
    const q = await env.DB.prepare('SELECT COUNT(*) AS n FROM deliveries WHERE sent_at IS NULL AND error IS NULL').first();
    return json({ subscribers: Object.fromEntries(results.map(r => [r.status, r.n])), queued: q.n });
  }
  if (url.pathname === '/admin/announce' && request.method === 'POST') {
    const b = await request.json();
    if (!b.subject || !b.text || !b.html) return json({ ok: false, error: 'subject, text and html are all needed' }, 400);
    const now = new Date().toISOString();
    const c = await env.DB.prepare('INSERT INTO campaigns (subject, text, html, created_at) VALUES (?, ?, ?, ?) RETURNING id').bind(b.subject, b.text, b.html, now).first();
    const r = await env.DB.prepare("INSERT INTO deliveries (campaign_id, subscriber_id) SELECT ?, id FROM subscribers WHERE status = 'confirmed'").bind(c.id).run();
    return json({ ok: true, campaign: c.id, queued: r.meta.changes, minutes: Math.ceil(r.meta.changes / BATCH) });
  }
  if (url.pathname === '/admin/mail-log' && env.MAIL_MODE === 'log') {
    const { results } = await env.DB.prepare('SELECT * FROM mail_log ORDER BY id').all();
    return json(results);
  }
  return new Response('Not found', { status: 404 });
}

/* ---------- the announcement, a batch a minute ---------- */
async function sendBatch(env) {
  const { results } = await env.DB.prepare(`SELECT d.campaign_id, d.subscriber_id, s.email, s.unsub_token, c.subject, c.text, c.html
    FROM deliveries d JOIN subscribers s ON s.id = d.subscriber_id JOIN campaigns c ON c.id = d.campaign_id
    WHERE d.sent_at IS NULL AND d.error IS NULL AND s.status = 'confirmed' ORDER BY d.campaign_id, d.subscriber_id LIMIT ?`).bind(BATCH).all();
  for (const r of results) {
    const unsub = `${env.PUBLIC_URL}/unsubscribe?t=${r.unsub_token}`;
    let error = null;
    try {
      await sendMail(env, {
        to: r.email, subject: r.subject, unsubscribe: unsub,
        text: `${r.text}\n\n—\n${DRAFT.footer}\n${DRAFT.unsubLink}: ${unsub}\n${env.SENDER_NAME}, ${env.POSTAL_ADDRESS}`,
        html: emailHTML(env, r.html, unsub),
      });
    } catch (e) { error = String(e.message || e).slice(0, 500); }
    await env.DB.prepare('UPDATE deliveries SET sent_at = ?, error = ? WHERE campaign_id = ? AND subscriber_id = ?')
      .bind(error ? null : new Date().toISOString(), error, r.campaign_id, r.subscriber_id).run();
  }
}

/* ---------- sending through Microsoft Graph (as contact@prothesis.net) ---------- */
let graphToken = null;   // { value, expires }
async function token(env) {
  if (graphToken && graphToken.expires > Date.now() + 60000) return graphToken.value;
  const res = await fetch(`https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.CLIENT_ID, client_secret: env.CLIENT_SECRET, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }),
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
  const j = await res.json();
  graphToken = { value: j.access_token, expires: Date.now() + j.expires_in * 1000 };
  return graphToken.value;
}
// Sent as raw MIME (Graph's sendMail accepts it) so the List-Unsubscribe headers that mail apps use for their own
// "Unsubscribe" button can be set: Graph's JSON form only allows headers starting with "x-".
async function sendMail(env, m) {
  if (env.MAIL_MODE === 'log') {
    await env.DB.prepare('INSERT INTO mail_log (to_addr, subject, text, html, unsubscribe, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(m.to, m.subject, m.text, m.html, m.unsubscribe || null, new Date().toISOString()).run();
    return;
  }
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.SENDER)}/sendMail`, {
    method: 'POST', headers: { Authorization: `Bearer ${await token(env)}`, 'Content-Type': 'text/plain' },
    body: b64(mime(env, m)),
  });
  if (res.status !== 202) throw new Error(`sendMail ${res.status}: ${await res.text()}`);
}
function mime(env, m) {
  const boundary = 'b' + randomToken().slice(0, 24);
  const head = [
    `From: ${encWord(env.SENDER_NAME)} <${env.SENDER}>`, `To: <${m.to}>`, `Subject: ${encWord(m.subject)}`,
    'MIME-Version: 1.0', `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  if (m.unsubscribe) head.push(`List-Unsubscribe: <${m.unsubscribe}>`, 'List-Unsubscribe-Post: List-Unsubscribe=One-Click');
  const part = (type, body) => [`--${boundary}`, `Content-Type: ${type}; charset=utf-8`, 'Content-Transfer-Encoding: base64', '', wrap(b64(body))].join('\r\n');
  return head.join('\r\n') + '\r\n\r\n' + part('text/plain', m.text) + '\r\n' + part('text/html', m.html) + `\r\n--${boundary}--\r\n`;
}
function emailHTML(env, inner, unsub) {
  return `<!doctype html><html lang="en"><body style="margin:0;background:#F3F3ED">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F3ED"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="background:#101B23;padding:28px 32px;text-align:center"><img src="${env.SITE_ORIGIN}/assets/img/logo-primary-light.png" alt="Prothesis" width="200" style="display:block;margin:0 auto;width:200px;height:auto"></td></tr>
<tr><td style="background:#ffffff;padding:32px;font:17px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#101B23">${inner}</td></tr>
<tr><td style="padding:20px 8px;font:13px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#443A31;text-align:center">
${unsub ? `${DRAFT.footer}<br><a href="${unsub}" style="color:#443A31">${DRAFT.unsubLink}</a><br>` : ''}${esc(env.SENDER_NAME)} · ${esc(env.POSTAL_ADDRESS)} · <a href="mailto:${env.SENDER}" style="color:#443A31">${env.SENDER}</a>
</td></tr></table></td></tr></table></body></html>`;
}

/* ---------- small pages (confirm, unsubscribe, no-JavaScript thanks), in the site's own look ---------- */
function page(env, status, message, extra = '') {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prothesis</title><link rel="stylesheet" href="${env.SITE_ORIGIN}/style.css"><meta name="robots" content="noindex">
<style>.note{font-family:"Prothesis Basic",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:12vh 24px;text-align:center;background:#101B23;color:#F3F3ED}
.note .logo{width:200px;height:auto}.note p{max-width:28em;text-wrap:balance;font-size:clamp(20px,2vw,26px);line-height:1.45}.note a{color:#F3F3ED}.note .btn{margin:0;border:0;cursor:pointer;font-family:inherit}.note .fine{font-size:16px}</style></head>
<body><main class="note"><a href="${env.SITE_ORIGIN}/"><img class="logo" src="${env.SITE_ORIGIN}/assets/img/logo-primary-light.png" alt="Prothesis" width="2373" height="335"></a>
<p>${message}</p>${extra}<p class="fine"><a href="${env.SITE_ORIGIN}/">${DRAFT.back}</a></p></main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

/* ---------- helpers ---------- */
async function allowAttempt(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const who = (await sha256(`${env.IP_SALT || ''}|${ip}`)).slice(0, 32);   // the address itself is never stored
  const bucket = new Date().toISOString().slice(0, 13);                      // this hour
  await env.DB.prepare("DELETE FROM attempts WHERE bucket < ?").bind(bucket).run();
  const r = await env.DB.prepare(`INSERT INTO attempts (bucket, who, n) VALUES (?, ?, 1)
    ON CONFLICT (bucket, who) DO UPDATE SET n = n + 1 RETURNING n`).bind(bucket, who).first();
  return r.n <= MAX_TRIES_PER_HOUR;
}
async function readBody(request) {
  const type = request.headers.get('Content-Type') || '';
  if (type.includes('application/json')) return await request.json().catch(() => ({}));
  const f = await request.formData().catch(() => null);
  return f ? Object.fromEntries(f) : {};
}
function wantsJSON(request) { return (request.headers.get('Accept') || '').includes('application/json'); }
function cors(env, res) {
  const h = new Headers(res.headers);
  h.set('Access-Control-Allow-Origin', env.SITE_ORIGIN); h.set('Vary', 'Origin');
  h.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); h.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  return new Response(res.body, { status: res.status, headers: h });
}
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
function randomToken() { const a = new Uint8Array(24); crypto.getRandomValues(a); return [...a].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function sha256(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join(''); }
function minutesSince(iso) { return (Date.now() - Date.parse(iso)) / 60000; }
function b64(s) { const bytes = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin); }
function wrap(s) { return s.replace(/.{1,76}/g, '$&\r\n').trim(); }
function encWord(s) { return /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`; }
function csvCell(v) { v = String(v ?? ''); return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
