# Your own waitlist — plan

*Prepared 24 October 2026. Nothing here is live; nothing has been created, deployed or sent.*

## The recommendation, in short

Put the sign-up **on prothesis.net itself**, in the last chapter: an email field next to the gold "Join the waitlist" button, styled like the rest of the site. When someone signs up, a small program on **Cloudflare** (free) stores their email and sends a "please confirm" email **from contact@prothesis.net, through your Microsoft 365**. When the app is ready, one command sends the announcement to everyone who confirmed, from the same address, with an unsubscribe link in every email.

**Cost: $0 a month** at your size: Cloudflare's free plan, plus the Microsoft 365 you already pay for. No outside scripts on your site, no cookies, nothing tracking visitors.

## How it works

1. **The form** stays on your page. It also works with JavaScript switched off.
2. **Spam:** a hidden field that only bots fill in, a check for forms sent faster than a person can type, and a limit of 5 tries an hour from one address. No "I'm not a robot" puzzle.
3. **Confirm by email ("double opt-in"):** only people who confirm are counted, so nobody can sign up someone else. The link opens a page with a "Confirm my email" button, because Outlook's link scanners open every link in an email and would otherwise confirm people by accident.
4. **The list** lives in Cloudflare's database (D1). You download it as a spreadsheet (CSV) whenever you like, with each person's sign-up and confirmation dates and the words they agreed to. That's your consent record.
5. **The "it's ready" email:** you write it, and it goes out to every confirmed person about 25 a minute (Microsoft lets one mailbox send 30 a minute and 10,000 a day), so 1,000 people take about 40 minutes. Each email has an unsubscribe link and your postal address. Mail apps' own "Unsubscribe" buttons work too.

I've built and tested all of this on this machine with a local copy of the database. Emails were recorded instead of sent.

## The three options, side by side

| | **A. Your form + Cloudflare + Microsoft 365** (recommended) | B. All Microsoft (Power Automate) | C. A newsletter service (e.g. Buttondown) with your styled form |
|---|---|---|---|
| Monthly cost | **$0** | **$15/user/month** (Power Automate Premium, needed for the web-request trigger), or $0.60 per sign-up on pay-as-you-go | Free up to 100 subscribers; roughly **$9/month up to 1,000** and **$29/month up to 5,000** (third-party price lists; check Buttondown's page) |
| Looks like your site | Yes, everywhere (form, confirm pages, emails) | Form yes; confirm/unsubscribe pages are harder | Form yes; their confirm and unsubscribe pages carry their look unless you pay for add-ons |
| Sends from contact@prothesis.net | Yes, through your M365 | Yes | Yes, after adding their DNS records |
| Where the list lives | Cloudflare, exportable to Excel | Your SharePoint/Excel | Their system, exportable |
| Writing the announcement | You give me the words, I send it (or a one-line command) | Build a second flow | Their editor: easiest |
| Maintenance | Very little; a small program you own | Flows can break when Microsoft changes things | None |
| Best if | You want it yours, free, and on-brand | You want everything inside Microsoft | The list grows past ~5,000, or you'll send regular news |

**Why A over C for now:** it's free, entirely yours, and every screen matches the site. If you later send regular newsletters, the list exports straight into a service like Buttondown.

## "When does Cloudflare start charging me?"

**Only if you choose to upgrade.** The free plan has hard daily limits; going over them makes requests fail until midnight UTC, rather than creating a bill.
- **Workers Free:** 100,000 requests a day, 10 ms of computing per request. Over the limit, Cloudflare returns "Error 1027" until the next day.
- **D1 database, free:** 5 million rows read a day, 100,000 rows written a day, 5 GB storage (500 MB per database). Since **1 September 2026** these are enforced: queries over the limit fail until midnight UTC, and stored data is untouched.
- **Workers Paid:** **$5/month minimum**, includes 10 million requests and 30 million CPU-milliseconds a month (then $0.30 per extra million requests).
- **Your scale:** a sign-up uses 1 request and about 10 database writes (counting index updates). The every-minute sender uses 1,440 requests a day. You'd need about 10,000 sign-ups in one day to reach a free limit. **Expected bill: $0.**
- **Cloudflare's own email sending** needs the $5 plan (3,000 emails a month included). That's why this plan sends through your Microsoft 365 instead.

I could not open Cloudflare's billing pages from here; the figures come from their documentation via search (sources at the end). Their pages don't say in so many words "the free plan is never billed". They describe going over the limit as failing, not charging, and the paid plan is something you switch on yourself.

## Things to know

- **Email reputation:** sending from your Microsoft 365 is well trusted, provided prothesis.net has its SPF, DKIM and DMARC records set up for Microsoft 365 (standard; 10 minutes to check). Exchange Online isn't meant for big marketing lists. For a few thousand people who asked to hear from you it's fine; past about 5,000, option C is the better tool.
- **The law (US, CAN-SPAM):** the announcement must include a **postal address** (a P.O. box is fine) and a working unsubscribe, honoured within 10 business days (this happens instantly here). The consent record is kept automatically.
- **Your privacy page must change:** it currently says sign-ups are collected through Microsoft Forms and stored in Microsoft 365.
- **Not yet proven against the real services:** sending through Microsoft Graph, and limiting the app to the one mailbox, were written but not run against your account. Neither could be from here. Both get checked with one test sign-up after setup, before going live.

## What you'd do yourself (about 30–45 minutes, I'll walk you through it), in order

1. **Cloudflare:** create a free account (no paid plan). Tell me the account's workers.dev name.
2. **Microsoft 365 admin, Entra admin centre:** register an app called "Prothesis waitlist", add the Microsoft Graph application permission **Mail.Send**, grant admin consent, and create a client secret. Copy three values: tenant ID, client ID and the secret.
3. **Microsoft 365, Exchange:** limit that app to **contact@prothesis.net only**, so it can't send as anyone else. That's a few PowerShell lines I'll give you ("RBAC for Applications", or an "application access policy").
4. **Check DNS:** in the Microsoft 365 admin centre's domain settings, confirm prothesis.net shows SPF and DKIM as set up. Add a DMARC record if missing. Nothing changes on GitHub Pages.
5. **Give me** the Cloudflare login step (or run three commands I give you), the three Microsoft values, and your postal address. I deploy, run a test sign-up to your own email, and you check it.
6. **Approve the wording** (below), then I switch the site's button over and update the privacy page, ready for you to publish.

## Decisions for you

1. **Option A, B or C?** (A recommended.)
2. **Where the form sits:** in the last chapter in place of the button link (as in the mock-up), or its own page.
3. **The postal address** for the emails.
4. **All new wording.** Every line below is a DRAFT; nothing goes live until you've approved or rewritten it:
   - Hidden field name read aloud to screen readers: "Email address". Placeholder in the field: "you@example.com".
   - After signing up: "Thank you. Please check your inbox and confirm your email."
   - Mistakes: "That doesn't look like an email address. Please check it." / "Too many tries just now. Please wait a few minutes and try again." / "Something went wrong. Please try again, or write to contact@prothesis.net."
   - Confirmation email subject: "Please confirm your email for Prothesis". Body: "You asked us to let you know when our first app is ready. Please confirm your email:" [Confirm my email] "If this wasn't you, ignore this email and we won't write again."
   - Confirm page: "One last step: confirm that you'd like to hear when our first app is ready." Then: "Thank you. You're on the list. We'll write when our first app is ready."
   - Unsubscribe page: "Stop all emails from Prothesis about this phone app?" [Unsubscribe], then "You're unsubscribed. We won't write again."
   - Email footer: "You're receiving this because you joined the waitlist at prothesis.net." Unsubscribe · Prothesis · [postal address] · contact@prothesis.net
   - Privacy page, the "Where it is kept" paragraph, suggested replacement: "Waitlist sign-ups are stored with Cloudflare, which runs the sign-up for us, and the emails we send come from our Microsoft 365 account. We keep your email address, when you signed up and when you confirmed, and nothing else."
5. **Optional:** also copy each sign-up into an Excel sheet or SharePoint list in your Microsoft 365 so you can see it there. It needs one more Microsoft permission; the CSV export already opens in Excel.

## Files

- `worker/src/index.js` — the program (sign-up, confirm, unsubscribe, export, announcement)
- `worker/schema.sql` — the database tables
- `worker/wrangler.toml.example` — settings to fill in (no secrets inside)
- `mockup/` — the last chapter with the form (`index.html`, `waitlist.css`, `waitlist.js`)
- Screenshots: `form-1280.png`, `thanks-1280.png`, `form-390.png`, `thanks-390.png`, `error-390.png`, `confirm-page-1280.png`, `confirmed-page-1280.png`, `unsubscribe-page-1280.png`, `nojs-thanks-1280.png`, `email-confirmation.png`, `email-announcement.png`

## Sources

- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Workers limits (Error 1027)](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- [D1 enforces free tier daily query limits (1 Sep 2026)](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/)
- [Cloudflare Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Power Automate pricing](https://www.microsoft.com/en-us/power-platform/products/power-automate/pricing)
- [Exchange Online limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits)
- [External recipient limit cancelled (Jan 2026)](https://techcommunity.microsoft.com/blog/exchange/exchange-online-canceling-the-mailbox-external-recipient-rate-limit/4483498)
- [RBAC for Applications in Exchange Online](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac)
- Buttondown prices are from third-party lists ([toolradar](https://toolradar.com/tools/buttondown/pricing)); check buttondown.com before deciding.
