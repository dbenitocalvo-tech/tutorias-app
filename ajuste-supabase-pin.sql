-- ============================================================
--  TUTORÍAS · Ajuste para la app con PIN (Opción A)
--  Pega TODO esto en el SQL Editor de Supabase y presiona "Run".
--
--  Crea una tabla única donde la app guarda todo su estado (en
--  formato JSON) y abre el acceso con la llave pública, ya que el
--  login por PIN se valida dentro de la app (no con Supabase Auth).
-- ============================================================

-- 1. Tabla de estado: una sola fila ('singleton') guarda todo.
create table if not exists app_estado (
  id              text primary key default 'singleton',
  data            jsonb not null default '{}'::jsonb,
  actualizado_en  timestamptz not null default now()
);

-- 2. Seguridad: activamos RLS y permitimos lectura/escritura a la
--    llave pública (rol 'anon'). La separación coordinador/tutor la
--    controla la app. Es el modelo acordado en la Opción A.
alter table app_estado enable row level security;

drop policy if exists app_estado_acceso on app_estado;
create policy app_estado_acceso on app_estado
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 3. Permisos: los roles anon/authenticated necesitan permiso de
--    tabla además de la política RLS para poder leer y escribir.
grant select, insert, update, delete on table app_estado to anon, authenticated;

-- ============================================================
--  Si todo salió bien verás "Success. No rows returned".
--  En "Table Editor" debe aparecer la tabla app_estado.
-- ============================================================
