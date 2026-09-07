-- 014_child_reports.sql
-- El informe del período de un niño, tal como lo dejó el logopeda.
--
-- Guarda el borrador de trabajo, no un documento firmado inmutable: período,
-- versión elegida (familia o entorno) y el comentario que el logopeda escribe
-- con sus palabras. El cuerpo del informe NO se guarda: se vuelve a derivar de
-- las sesiones cada vez, para que nunca quede congelado un número que ya no es.
--
-- Una fila por niño (el último informe). Mientras esta migración no esté
-- aplicada, la app guarda el borrador en el navegador y no pierde nada.

create table if not exists public.child_reports (
  child_id     uuid primary key references public.children(id) on delete cascade,
  therapist_id uuid not null references public.profiles(id),
  period_id    text not null default 'mes',
  period_from  date not null,
  period_to    date not null,
  version      text not null default 'familia',
  comment_text text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  check (period_from <= period_to),
  check (version in ('familia', 'entorno'))
);

alter table public.child_reports enable row level security;

-- Solo el logopeda del niño ve y escribe su informe. La familia no entra aquí:
-- lo que la familia recibe es el documento que el logopeda le comparte.
create policy "child_reports_select_therapist"
  on public.child_reports for select
  using (
    exists (
      select 1 from public.children
      where id = child_reports.child_id and therapist_id = auth.uid()
    )
  );

create policy "child_reports_insert_therapist"
  on public.child_reports for insert
  with check (
    therapist_id = auth.uid()
    and exists (
      select 1 from public.children
      where id = child_id and therapist_id = auth.uid()
    )
  );

create policy "child_reports_update_therapist"
  on public.child_reports for update
  using (
    exists (
      select 1 from public.children
      where id = child_reports.child_id and therapist_id = auth.uid()
    )
  );
