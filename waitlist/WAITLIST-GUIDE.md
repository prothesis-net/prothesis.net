# Waitlist on Cloudflare — the plan and the guided setup

*For Albert and for Claude Code. Written 24 October 2026. Nothing in here is live yet.*

This file is the plan for replacing the Microsoft Form behind "Join the waitlist" on prothesis.net with a sign-up of our own, hosted on Cloudflare, sending email from contact@prothesis.net through Microsoft 365. It is also the **runbook Claude Code follows** to guide the setup: the steps are in order, each says who does it, and each ends at a checkpoint where Claude stops until Albert says to go on.

**To start (or pick up) the work in a Claude Code session:** say *"Follow WAITLIST-GUIDE.md and guide me through the next step."* Claude reads the **Progress** list at the bottom, tells Albert where things stand, and carries on from the first unticked step.

---

## 1. What changes for a visitor

- In the last chapter of the home page ("Nothing is counted…"), the gold **Join the waitlist** button gets an **email field** beside it. A visitor types their email and presses the button, without leaving the page. It looks like the rest of the site, and works with JavaScript off.
- They get an email from **contact@prothesis.net**: *"Please confirm your email"*, with a gold **Confirm my email** button. Only confirmed people are on the list, so nobody can sign up someone else.
- When the app is ready, everyone who confirmed gets the announcement from the same address. Every email has an **unsubscribe** link that works in one click.
- No outside scripts on the site, no cookies, nothing tracking visitors. (The site tracks nothing today, and that stays so.)

## 2. How it works

```
 prothesis.net (GitHub Pages, unchanged hosting)
   └─ the form in the last chapter ──posts the email──▶  Cloudflare Worker (a small program, free plan)
                                                          ├─ stores it in Cloudflare D1 (a small database)
                                                          └─ asks Microsoft 365 (Microsoft Graph) to send
                                                             the confirmation email as contact@prothesis.net
```

- **Hosting of the site does not move.** prothesis.net stays on GitHub Pages and its DNS stays as it is. The Worker lives at its own free Cloudflare address (something like `prothesis-waitlist.<name>.workers.dev`).
- **Spam protection without puzzles:** a hidden field only bots fill in, a "too fast to be a person" check, and at most 5 tries an hour from one address.
- **The confirm link opens a page with a button** rather than confirming on its own, because Outlook's link scanner opens every link in an email.
- **The list** can be downloaded as a spreadsheet (CSV) at any time, with sign-up and confirmation dates: that is the consent record.

## 3. Cost

**$0 a month.** Cloudflare's free plan, plus the Microsoft 365 already paid for.

- Cloudflare's free plan has daily limits: 100,000 requests a day for Workers, and 100,000 database writes a day for D1. Going over **fails** until midnight UTC; it does not bill. A sign-up uses about 1 request and 10 writes, so the limit is around **10,000 sign-ups in a single day**.
- The **$5/month** Workers Paid plan is only ever switched on by Albert, never automatically. Worth considering only before an expected surge, such as press coverage.
- Microsoft 365 lets one mailbox send about 30 emails a minute, so the announcement goes out at about 25 a minute: 1,000 people take about 40 minutes.

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) · [D1 limit enforcement, 1 Sep 2026](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/) · [Exchange Online limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits)

## 4. Who does what

| Albert does (Claude explains each click) | Claude Code does |
|---|---|
| Decisions and wording approval | Writes and tests all the code (form, Worker, database, emails) |
| Accounts: Cloudflare (done), Microsoft 365 admin | Gives exact click-paths and PowerShell lines |
| Creates the access keys and stores them in the Claude Code environment settings | Deploys the Worker with those keys, without ever displaying them |
| Approves the test result and each publish | Runs a test sign-up, then prepares the site change on a branch |

### Rules Claude Code follows throughout

1. **Never ask for a password, key or secret in the chat.** Keys go into the Claude Code environment's settings (the cloud environment menu in the session's title bar → *Edit* → Network secrets or environment variables). A new session picks them up. Claude reads them by name and never prints them.
2. **Never move prothesis.net's DNS or hosting** to Cloudflare, and never change GitHub Pages settings.
3. **Never publish** (push to `main`) without Albert's explicit go-ahead for that change. Work happens on a branch.
4. **Never send an email to anyone but Albert** until he has approved the test and the wording. The announcement is sent only when he asks for it, with the final text.
5. **No new visible words** go on the site or in emails unless Albert has approved them; every draft line stays marked DRAFT until then.
6. **Keep the Microsoft Form link working** until the new sign-up has passed its test; it is the fallback.
7. **Stop at every checkpoint** (marked ⏸) and wait for Albert.
8. When something in Microsoft's or Cloudflare's setup screens doesn't match these notes (menus get renamed), Claude checks the current official documentation before giving the next click.

---

## 5. The steps

### Step 0 — Decisions (Albert)

1. **Route:** A (this plan: Cloudflare + Microsoft 365, $0), B (all Microsoft with Power Automate, about $15 a month), or C (a newsletter service such as Buttondown with our styled form, about $9 a month up to 1,000 people). This guide assumes A.
2. **Where the form sits:** in the last chapter beside the button (recommended), or on its own page.
3. **Postal address** for the emails: US law (CAN-SPAM) requires one in the announcement. A P.O. box or virtual mailbox is fine.
4. **Wording:** approve or rewrite every DRAFT line in section 6.
5. **Optional:** also copy each sign-up into an Excel sheet or SharePoint list in Microsoft 365 (one more Microsoft permission). The CSV download already opens in Excel.

⏸ **Checkpoint:** Claude records the decisions in the Progress list and goes on to Step 1.

### Step 1 — Check access (Albert, about 5 minutes)

1. **Cloudflare:** the account exists. Confirm its sign-in email is **developer@prothesis.net**, not .com, and that two-step sign-in is on.
2. **Microsoft 365 admin role.** In the Entra admin center (entra.microsoft.com) → *Users* → *All users* → **Albert Lee** → *Assigned roles*. It needs **Global Administrator** (or both *Privileged Role Administrator* and *Exchange Administrator*).
   - The tenant's sign-in names end in `NETORGFT…onmicrosoft.com`, which usually means Microsoft 365 was bought through **GoDaddy**. GoDaddy sometimes keeps the top admin role. If Albert lacks it, Claude explains the options (asking GoDaddy, or moving the Microsoft 365 account to be managed directly) before anything else. **This is the one thing that could change the plan.**
3. **The sending mailbox:** contact@prothesis.net is a licensed user ("Prothesis") in the tenant. ✓ (seen 24 Oct)
4. **Email authentication:** in the Microsoft 365 admin center → *Settings* → *Domains* → prothesis.net, check that SPF and DKIM show as set up. If DMARC is missing, Claude gives the one DNS record to add at the domain's DNS host. This is the only DNS change in the whole plan, and it's optional but recommended.

⏸ **Checkpoint:** Albert reports what he saw. Claude continues only if the admin role is there.

### Step 2 — Let the Worker send as contact@ only (Albert, about 15 minutes, guided)

1. **Register an app:** Entra admin center → *App registrations* → *New registration*, named **Prothesis waitlist mailer**, single tenant. Note its **Application (client) ID** and the **Directory (tenant) ID**; these aren't secrets.
2. **Create a client secret** (*Certificates & secrets* → *New client secret*). Set the longest allowed expiry and **note the expiry date**; Claude will remind Albert to renew it before then. The secret value is shown only once: Albert puts it **straight into the Claude Code environment settings** (Step 3), never into chat or email.
3. **Limit the app to contact@prothesis.net only.** The safe way is Exchange Online's "RBAC for Applications": the app gets the *Application Mail.Send* role scoped to that one mailbox, instead of the tenant-wide Graph *Mail.Send* permission (which would let it send as anyone). Claude gives the exact PowerShell lines for Exchange Online PowerShell at this step, after re-checking Microsoft's current documentation, because Microsoft's pages on this have recently disagreed. ([RBAC for Applications](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac))
4. Claude confirms the result with Albert, using a test Claude provides, before going on.

⏸ **Checkpoint:** the app exists, its secret is stored, and it can send only as contact@.

### Step 3 — Give this Claude Code environment what it needs (Albert, about 5 minutes)

In the Claude Code environment settings (cloud environment menu in the session's title bar → *Edit*):

1. **Network access:** allow these hosts under *Allowed domains* (keep *Allow package managers* ticked):
   - `api.cloudflare.com` (to deploy and manage the Worker and database)
   - `workers.dev` and `*.workers.dev` (to test the deployed sign-up)
   - `prothesis.net` (optional: so Claude can check the live site after publishing)

   Steps: https://code.claude.com/docs/en/cloud-environments#network-access
2. **Secrets** (as Network secrets or environment variables), with these exact names:
   - `CLOUDFLARE_API_TOKEN`: a Cloudflare API token. Cloudflare dashboard → *My Profile* → *API Tokens* → *Create Token* → the **Edit Cloudflare Workers** template, plus **D1: Edit**, limited to Albert's account only.
   - `CLOUDFLARE_ACCOUNT_ID`: from the Cloudflare dashboard (*Workers & Pages* overview, right-hand side). Not secret, but stored the same way.
   - `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`: from Step 2.
3. **Start a new Claude Code session** so the settings take effect, and say *"Follow WAITLIST-GUIDE.md: Step 4."*

⏸ **Checkpoint:** Claude checks the variables are present (by name only) and that it can reach `api.cloudflare.com`.

### Step 4 — Deploy the sign-up service (Claude)

1. Create the D1 database `prothesis-waitlist` and apply `worker/schema.sql`.
2. Fill in `wrangler.toml` from `worker/wrangler.toml.example`: no secrets in the file. Set the sender (contact@prothesis.net), the allowed origin (`https://prothesis.net`) and the approved postal address and wording.
3. Pass the Microsoft values into the Worker as Cloudflare secrets (`wrangler secret put`, fed from the environment variables, never echoed), plus an admin token for the export, generated and stored the same way.
4. Deploy to the free workers.dev address and note it here.

⏸ **Checkpoint:** Claude tells Albert the Worker's address and that it's running. Nothing on the site has changed yet.

### Step 5 — Test it end to end (Claude and Albert, about 10 minutes)

1. Claude signs up **Albert's own address** through the Worker. Albert checks the confirmation email arrived from contact@prothesis.net and isn't in spam, and that it looks right.
2. Albert presses **Confirm my email**, then checks the "you're on the list" page.
3. Albert tries the **unsubscribe** link (then signs up again if he likes).
4. Claude downloads the list and shows Albert the spreadsheet.
5. Claude checks the spam guards and the limit, and that the app **cannot** send as any other mailbox.

⏸ **Checkpoint:** Albert approves the result. If anything is off, Claude fixes it and repeats this step.

### Step 6 — Switch the site over (Claude prepares, Albert approves)

1. On a branch: add the email field to the last chapter (the approved mock-up), point it at the Worker, and keep a plain fallback for visitors without JavaScript.
2. Update the **privacy page's** "Where it is kept" paragraph with Albert's approved wording. Remove the Microsoft Forms wording.
3. Claude tests the form on desktop and phone sizes, with JavaScript off and with reduced motion, and shows Albert screenshots.
4. **Only on Albert's go-ahead:** publish (push to `main`), then confirm GitHub Pages deployed it. Claude does a real sign-up through the live page with Albert's address.

⏸ **Checkpoint:** live. Keep the Microsoft Form available (unlinked) for a couple of weeks as a fallback, then retire it.

### Step 7 — Running it

- **See the list:** ask Claude *"download the waitlist"*. The CSV opens in Excel.
- **Send the announcement:** Albert writes it (Claude can help). Claude shows a preview, sends one test to Albert, and on his go-ahead sends to everyone confirmed, at about 25 a minute, each with unsubscribe and the postal address.
- **Renew the Microsoft client secret** before its expiry date (noted in Progress), the same way as Step 2.2. Claude can set a reminder.
- **If the sign-up ever breaks,** point the button back to the Microsoft Form (a one-line change) while Claude looks into it.

---

## 6. Wording to approve (all DRAFT)

- Field hint: "you@example.com". Read aloud to screen readers: "Email address".
- After signing up: "Thank you. Please check your inbox and confirm your email."
- Problems: "That doesn't look like an email address. Please check it." / "Too many tries just now. Please wait a few minutes and try again." / "Something went wrong. Please try again, or write to contact@prothesis.net."
- Confirmation email subject: "Please confirm your email for Prothesis". Body: "You asked us to let you know when our first app is ready. Please confirm your email:" [Confirm my email] "If this wasn't you, ignore this email and we won't write again."
- Confirm page: "One last step: confirm that you'd like to hear when our first app is ready." Then: "Thank you. You're on the list. We'll write when our first app is ready."
- Unsubscribe page: "Stop all emails from Prothesis about this phone app?" [Unsubscribe], then "You're unsubscribed. We won't write again."
- Email footer: "You're receiving this because you joined the waitlist at prothesis.net." · Unsubscribe · Prothesis · [postal address] · contact@prothesis.net
- Privacy page, new "Where it is kept": "Waitlist sign-ups are stored with Cloudflare, which runs the sign-up for us, and the emails we send come from our Microsoft 365 account. We keep your email address, when you signed up and when you confirmed, and nothing else."

## 7. Known risks and open questions

- **Admin rights on a GoDaddy-provided Microsoft 365** (Step 1.2): the main unknown.
- **Restricting the app to one mailbox:** Microsoft's documentation has disagreed with itself. It gets settled at Step 2.3 and proven at Step 5.5.
- **Fonts on the Worker's confirm and unsubscribe pages** load from prothesis.net. If GitHub Pages doesn't allow that, those pages fall back to a plain font, or they can move onto prothesis.net itself.
- **Email volume:** Exchange Online is right for a few thousand people who asked to hear from us. If the list grows past about 5,000, or regular newsletters begin, move the list to a newsletter service (the CSV exports straight in).

## 8. Where the work is

The prototype was built and tested locally on 24 October 2026 (database emulated, emails recorded rather than sent):

- `worker/src/index.js`: the Worker (sign-up, confirm, unsubscribe, export, announcement)
- `worker/schema.sql`: the database tables
- `worker/wrangler.toml.example`: settings template, no secrets
- `mockup/`: the last chapter with the form (`index.html`, `waitlist.css`, `waitlist.js`)
- Screenshots: `form-1280.png`, `form-390.png`, `thanks-1280.png`, `email-confirmation.png`, and the confirm and unsubscribe pages
- `PLAN.md`: the longer comparison of the three routes

---

## Progress

*(Claude ticks these as they happen, with the date.)*

- [ ] Step 0: decisions (route, form placement, postal address, wording, Excel copy)
- [x] Step 1.1: Cloudflare account created (24 Oct). Sign-in email: confirm .net
- [ ] Step 1.2: admin role confirmed
- [x] Step 1.3: contact@ is a licensed user (seen 24 Oct)
- [ ] Step 1.4: SPF / DKIM / DMARC checked
- [ ] Step 2: app registered, secret stored (expiry date: ____), limited to contact@
- [ ] Step 3: network access and secrets added to the Claude Code environment
- [ ] Step 4: Worker deployed at: ____
- [ ] Step 5: end-to-end test approved
- [ ] Step 6: site switched over and published
- [ ] Microsoft Form retired
