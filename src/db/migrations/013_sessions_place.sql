-- 013 — Lugar del mundo por partida (camino real / Supabase).
--
-- El showroom ya lo guarda en localStorage (`SessionResult.place`). Esta
-- migración da el mismo dato a las cuentas reales, para que "El recorrido de
-- {Nombre}" (los lugares explorados y el detalle por día) funcione también ahí.
--
-- Guarda `map_hotspots.id` (sol / faro / casa / pulpo / castillo), NO
-- `exercises.place` (cielo / casa / mar / playa). Son dos espacios de nombres
-- distintos y sólo coinciden en `casa`.
--
-- Es aditiva y nullable: sin aplicar, la app degrada con gracia (la familia ve
-- días, constancia e hitos; los lugares aparecen cuando se registren). Las
-- partidas anteriores quedan en NULL — nunca se inventa un lugar.

alter table public.sessions
  add column if not exists place text references public.map_hotspots(id);

comment on column public.sessions.place is
  'Hotspot del mapa donde se jugó la partida (map_hotspots.id). NULL = no registrado.';

-- Consulta típica: los lugares que visitó un niño en las últimas dos semanas.
create index if not exists sessions_child_place_idx
  on public.sessions (child_id, place)
  where place is not null;
