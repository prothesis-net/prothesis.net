# Waitlist Worker

The Cloudflare Worker behind the waitlist field on prothesis.net, deployed at
https://prothesis-waitlist.prothesis.workers.dev. Sign-ups go to Cloudflare D1 and are confirmed by
email from contact@prothesis.net through Microsoft Graph. Routes and settings are listed at the top of
`src/index.js`.

This folder starts with `_`, so GitHub Pages leaves it out of the site.

- `src/index.js`: the Worker.
- `schema.sql`: the D1 tables.
- `wrangler.toml.example`: the deployed settings with the database, tenant and client IDs taken out.
  Copy it to `wrangler.toml` and fill those in. `wrangler.toml` is git-ignored.

Secrets (`CLIENT_SECRET`, `ADMIN_TOKEN`, `IP_SALT`) are Cloudflare secrets set with
`wrangler secret put`. They are never stored in this repo.

Deploy with Wrangler 4.149.0: `npx wrangler@4.149.0 deploy`.
