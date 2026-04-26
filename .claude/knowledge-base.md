# Knowledge Base

System-wide learned rules. Read by ALL agents and sessions at startup.
Written ONLY by the auditor after confirming learnings.
Entries are mandatory constraints, not suggestions.

## Provenance Hierarchy
Every entry MUST cite its source using one of:
- `[Source: user override MMDDYY]` — User explicitly corrected something
- `[Source: empirical MMDDYY]` — Verified through testing or data
- `[Source: agent inference MMDDYY]` — Pattern observed by an agent, confirmed by auditor

## Hard Rules
- [042626] User workflow: default to autonomous execution after scope is agreed. Only re-confirm when scope expands beyond the agreed plan. Multiple "go / ok / fait tout" signals = friction point. (Source: user override 042626 — 3+ confirmations during session)

## Platform & Tool Rules
- [042626] Vercel deployment URLs (`<project>-<hash>-<team>.vercel.app`) are immutable per-deployment and each is a distinct browser origin. IndexedDB, localStorage, and Service Worker registrations do NOT carry across deployment URLs. Always use a stable alias or custom domain as the canonical URL for any app with client-side persistence. (Source: empirical 042626 — IDB data verified absent after deploy URL change)
- [042626] Vercel Authentication (SSO / Deployment Protection) can only be toggled in the dashboard (`Settings → Deployment Protection`). The `vercel` CLI cannot change it. Stable aliases inherit project-level auth and return 401 publicly until SSO is disabled. (Source: empirical 042626 — stable alias returned 401 while hash URL returned 200)
- [042626] Native ES modules (`<script type="module">`) require an HTTP origin. Opening via `file://` causes CORS errors on `import` statements. For local dev without a build tool, use `npx serve` or `python -m http.server`. (Source: empirical 042626 — confirmed during Wave 1 split)
- [042626] When persisting a Vercel deployment URL to memory or config, never use the per-deployment hashed URL — it goes stale on the next deploy. Use `vercel ls <project>` to fetch the current production URL, or use the configured stable alias. (Source: empirical 042626 — stale hash URL caused test confusion after second deploy)

## Project Patterns
- (none yet)

## Known Failure Modes
- [042626] W3C-style annotation anchoring (prefix + text + suffix, ~30 chars padding) survives marked.js re-rendering for unchanged source. `Range.surroundContents` fails on cross-element ranges; fallback via `extractContents` + `insertNode` handles them. (Source: empirical 042626 — highlight survived full page reload + re-anchor)
