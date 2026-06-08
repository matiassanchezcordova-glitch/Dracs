-- ============================================================
-- DRACS — Migration 004: public read access to `exercises`
-- Run in: Supabase Dashboard → SQL Editor
--
-- Why this policy exists:
--   The `exercises` table is a curated PUBLIC catalogue of
--   speech-therapy activities. It contains zero PII (no child
--   data, no therapist data, no session results) — only the
--   exercise definition (title, prompt, image URLs, options).
--
--   The frontend reads from this table using the ANON KEY,
--   including when a family is exploring the app without
--   having created an account yet (the "play without sign-in"
--   flow in ExerciseTab). Without this policy, RLS blocks
--   anonymous SELECT and the session builder returns an empty
--   set, breaking the onboarding flow.
--
--   Write access remains restricted (no INSERT/UPDATE/DELETE
--   policies for anon or authenticated). Only service_role
--   can mutate the catalogue, which is what we want.
--
-- Replaces / supersedes (cleanup later):
--   `exercises_select_authenticated` — narrower legacy policy
--   that only allowed signed-in users. Safe to drop after this
--   one is in place.
-- ============================================================

CREATE POLICY "exercises_public_read"
  ON public.exercises
  FOR SELECT
  TO anon, authenticated
  USING (true);
