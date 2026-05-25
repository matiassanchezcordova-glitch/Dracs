# Backlog

Future work captured during sessions. Not blocking; prioritize per upcoming session planning.

## Therapist verification

### Admin flow to verify therapists

**Issue:** Sesión 3 hotfix added `therapists.verified BOOLEAN DEFAULT false`
and filtered the family-side search by `.eq('verified', true)`. New therapists
who complete signup-ther-s3 are invisible to families until someone flips the
flag manually in SQL.

**Why it's a feature for MVP:** matches the goal of a curated therapist
directory while the product is small. Becomes a problem before opening public
therapist registration.

**Fix (sketch):** admin UI for verifying therapists, gated by an admin role
(role column on profiles, or a separate `admins` table). Options:
- Lightweight: a `/admin/therapists` route with a list and toggle, accessible
  only to a hardcoded admin email or a `profiles.role = 'admin'` row.
- Heavier: full review queue with status field (`pending`, `verified`,
  `rejected`), email notifications, optional license verification.

**When to do it:** before opening public therapist registration.

### Regenerate `database.types.ts` after `verified` column

The Sesión 3 hotfix SQL adds `therapists.verified` but the generated types
file at `src/lib/database.types.ts` does not reflect that column. The
Supabase client is currently untyped (no `<Database>` generic), so the code
compiles and runs fine, but `TherapistRecord = Row<'therapists'>` is stale.

**Fix:** rerun
`SUPABASE_ACCESS_TOKEN=... npx supabase gen types typescript --project-id bxhptoigtummmckxnkzv > src/lib/database.types.ts`
after the column lands in DB. Drop the trailing CLI banner lines as in
Sesión 2 (`head -n N`).

**When to do it:** next session, batched with other type regenerations
(`verified`, any new columns from upcoming migrations).

## Search UX

### Minor SQL-injection risk in therapist search `.or()`

**Issue:** `src/pages/auth/AuthPage.tsx#PatientStep3` does
`.or(\`center_name.ilike.%${query}%,city.ilike.%${query}%\`)` with raw user
input interpolated into the PostgREST filter string. Characters like `,`,
`)`, or `*` in `query` could change the meaning of the filter or surface
errors. PostgREST validates the filter syntax so SQL execution is safe, but
attacker-controlled wildcards or operator injection in the filter clause are
not impossible.

**Fix (sketch):** sanitize `query` before interpolation (strip
`%,()` characters or only allow `[a-zA-Z0-9 ñáéíóú-]`), or move the search
to a parameterized RPC (`create function search_therapists(q text)`).

**When to do it:** next refactor of the therapist search (whenever the
admin verification flow lands — likely same session).

