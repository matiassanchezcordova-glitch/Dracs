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

## Exercise migration (Sesión 5 fallout)

### Audit prompts in DB (some may be null/empty)

**Issue:** the S5 visual redesign uses `exercises.prompt` as the heading
shown to the child during each exercise. The adapter falls back to
`exercises.title` when `prompt` is null/empty, but `title` is internal
copy ("identify_image_pez_d1") and should never reach the UI. We do not
know how many rows currently have an empty prompt.

**Fix (sketch):** SQL audit `SELECT id, type, title, prompt FROM exercises
WHERE prompt IS NULL OR length(trim(prompt)) = 0;` and fill the gaps
with proper Spanish prompts ("Atrapá el flotador!", "Ordená los pasos
para ir a la playa", etc.). Content team task.

**When to do it:** before the next public demo / family pilot.

### `CATEGORY_BY_LEVEL` removed in S5 visual redesign

The previous chrome map ("Vocabulario · Cuerpo y hogar" etc.) was deleted
from `ExerciseScreen.tsx` in the visual rewrite — replaced by the
exercise's own `prompt` field. No further action required; leaving this
note so future devs don't reintroduce a hardcoded category strip.

### Render fill_blank option images + anchor image

**Issue:** the DB schema for `fill_blank` includes per-option `image_url`
and an optional top-level `anchor_image_url`, but `FillBlankQuestion.tsx`
is text-only (pill buttons with the word, no images). The S5 migration
intentionally ignored those fields to keep scope tight.

**Fix (sketch):** add an optional image thumbnail next to each pill, and
render the anchor image above the sentence when present. Adapter changes
in `data/exercises.ts` to surface those fields on `RuntimeFillBlank`.

**When to do it:** when designers confirm the visual treatment they want
for fill_blank pills with images.

### Mecánica B support (scene + hotspots)

**Issue:** 19 of the 55 exercises in DB are Mecánica B (a single scene
image with tappable hotspots). S5 explicitly filtered them out with
`.eq('content->>mechanic', 'A')` in `buildSessionFromDb`. They are
inaccessible from the app today.

**Fix (sketch):** new component (`SceneHotspotQuestion`?) that loads a
single image, overlays interactive zones from `content.hotspots`, and
reports correctness. Update the session builder to mix A and B per
level, and decide on a quota.

**When to do it:** when product confirms Mecánica B should ship to
families (it may stay therapist-curated only).

### Sparse Mecánica A inventory at higher difficulty

**Issue:** the current Mecánica A pool is uneven:
- `identify_image`: only difficulty 1-2 (zero at 3-5)
- `odd_one_out`: only 1-2
- `sequence`: 1, 2, 4 (no 3, no 5)
- `fill_blank`: 1-5 (well distributed)

`buildSessionFromDb` falls back gracefully (widens the difficulty range
when the target range is empty), but level 4 children end up doing
level 1-2 vocab/odd_one_out. We need more Mecánica A content authored
for difficulty 3+.

**When to do it:** content team task; flag during next content review.

### Drop legacy policy `exercises_select_authenticated`

**Issue:** Migration 004 adds the `exercises_public_read` policy. The
older `exercises_select_authenticated` policy is now redundant (the new
one already covers `authenticated` with broader rights). User confirmed
they will drop it manually but it's worth tracking.

**Fix:** `DROP POLICY IF EXISTS "exercises_select_authenticated" ON public.exercises;`

**When to do it:** next housekeeping pass on Supabase policies.

