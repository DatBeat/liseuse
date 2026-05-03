# Scratchpad

Quick capture. Processed during /sync, cleared at /wrap-up.

---

## 050326 — Scheduled health check + Supabase draft

### Task 1 — Vercel deployment health check

**Project:** datbeatbusiness/liseuse (`prj_7yO90eOfZVZTqCxTPUN8lHy2p8jS`)
**Latest production deployment:** `dpl_DSEQdtEHNQJToYp44wSCHDNxpzhR`
**URL:** https://liseuse-2pjm3mgma-datbeatbusiness.vercel.app
**Commit:** "Rebrand: Liseuse -> MDRead" (`62fd3028`)

| Check | Result |
|---|---|
| Build status | ✅ READY (SUCCESS) |
| Last 7 days — failed builds | ✅ 0 failures — all 14 deployments READY |
| Runtime logs (errors/fatals, 7d) | ✅ Clean — 0 errors (static site, no serverless) |
| HTTP 200 + `<title>` check | ⚠️ Blocked — Vercel SSO Authentication active (pre-existing known blocker, memory.md line 18/52) |

**Note on HTTP check:** All deployment URLs return 401 (SSO redirect). This is not a new regression — it's the known Vercel Authentication blocker pending user action (disable in Dashboard → Project → Settings → Deployment Protection). The app title is now "MDRead" post-rebrand.

**Verdict:** Deployment infrastructure is healthy. The only open issue is the SSO protection blocking public access, which is a configuration task for the user.

---

### Task 2 — Supabase schema draft

**File created:** `supabase/migrations/0001_init_library.sql`

Schema summary:
- `pgcrypto` extension for `gen_random_uuid()`
- `folders` table: id, user_id (→ auth.users cascade), name, parent_id (self-ref cascade), created_at
- `markdown_documents` table: id, user_id (→ auth.users cascade), folder_id (→ folders set null), title, content, file_size (generated stored), created_at, updated_at
- `set_updated_at()` trigger function + `trg_documents_updated_at` trigger on UPDATE
- Indexes: `(user_id, created_at desc)` on documents; `(user_id, parent_id)` on folders
- RLS enabled on both tables with SELECT/INSERT/UPDATE/DELETE policies scoped to `auth.uid() = user_id`

---
