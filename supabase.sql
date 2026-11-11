-- =====================================================================
--  Registro central de confirmaciones — Supabase (plan gratuito)
--  Pega TODO este archivo en Supabase → SQL Editor → Run.
--  El cupo se valida en el servidor: nadie puede confirmar más personas
--  de las autorizadas, aunque modifique la página.
-- =====================================================================

create table if not exists public.invitados (
  codigo  text primary key,           -- va en el enlace: https://tu-sitio/#codigo
  nombre  text not null,
  cupo    int  not null check (cupo between 1 and 20)
);

create table if not exists public.confirmaciones (
  id            bigint generated always as identity primary key,
  codigo        text not null references public.invitados(codigo),
  nombre        text not null,
  asiste        boolean not null,
  cantidad      int not null check (cantidad >= 0),
  acompanantes  text[] not null default '{}',
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now()
);
-- Una confirmación por invitación personal (si confirma de nuevo, se actualiza).
create unique index if not exists confirmaciones_una_por_codigo
  on public.confirmaciones(codigo) where codigo <> 'general';

-- Nadie accede a las tablas directamente desde la página: solo por las funciones.
alter table public.invitados      enable row level security;
alter table public.confirmaciones enable row level security;

-- Cupo de quien abre el enlace sin código
insert into public.invitados (codigo, nombre, cupo) values ('general', '', 1)
on conflict (codigo) do nothing;

-- ---------- Lee nombre y cupo de una invitación ----------
create or replace function public.obtener_invitado(p_codigo text)
returns json language sql security definer set search_path = public as $$
  select coalesce(
    (select json_build_object('encontrado', true, 'codigo', codigo, 'nombre', nombre, 'cupo', cupo)
       from invitados where codigo = lower(trim(p_codigo))),
    json_build_object('encontrado', false));
$$;

-- ---------- Guarda la confirmación respetando el cupo ----------
create or replace function public.confirmar_asistencia(
  p_codigo text, p_nombre text, p_cantidad int, p_acompanantes text[], p_asiste boolean)
returns json language plpgsql security definer set search_path = public as $$
declare v_cupo int; v_codigo text := lower(trim(coalesce(p_codigo, 'general')));
begin
  select cupo into v_cupo from invitados where codigo = v_codigo;
  if v_cupo is null then
    return json_build_object('ok', false, 'mensaje', 'Esta invitación no es válida. Pide un nuevo enlace a los organizadores.');
  end if;
  if length(trim(coalesce(p_nombre, ''))) < 3 then
    return json_build_object('ok', false, 'mensaje', 'Escribe tu nombre y apellido.');
  end if;
  if p_asiste and (p_cantidad < 1 or p_cantidad > v_cupo) then
    return json_build_object('ok', false, 'mensaje', format('Tu invitación permite máximo %s persona(s).', v_cupo));
  end if;
  if p_asiste and coalesce(array_length(p_acompanantes, 1), 0) <> p_cantidad - 1 then
    return json_build_object('ok', false, 'mensaje', 'Escribe el nombre de cada acompañante.');
  end if;

  if v_codigo = 'general' then
    insert into confirmaciones (codigo, nombre, asiste, cantidad, acompanantes)
    values (v_codigo, left(trim(p_nombre), 80), p_asiste, case when p_asiste then p_cantidad else 0 end, coalesce(p_acompanantes, '{}'));
  else
    insert into confirmaciones (codigo, nombre, asiste, cantidad, acompanantes)
    values (v_codigo, left(trim(p_nombre), 80), p_asiste, case when p_asiste then p_cantidad else 0 end, coalesce(p_acompanantes, '{}'))
    on conflict (codigo) where codigo <> 'general' do update
      set nombre = excluded.nombre, asiste = excluded.asiste, cantidad = excluded.cantidad,
          acompanantes = excluded.acompanantes, actualizado = now();
  end if;
  return json_build_object('ok', true);
end $$;

revoke all on function public.confirmar_asistencia(text, text, int, text[], boolean) from public;
grant execute on function public.confirmar_asistencia(text, text, int, text[], boolean) to anon;
grant execute on function public.obtener_invitado(text) to anon;

-- ---------- Resumen para los organizadores (Table Editor / SQL) ----------
create or replace view public.resumen_confirmaciones with (security_invoker = true) as
select i.nombre as invitacion, i.codigo, i.cupo,
       c.nombre as confirmo, c.asiste, c.cantidad, array_to_string(c.acompanantes, ', ') as acompanantes,
       c.actualizado
from invitados i left join confirmaciones c on c.codigo = i.codigo
order by c.actualizado desc nulls last;

-- =====================================================================
--  CARGA TUS INVITADOS (edita y ejecuta). El código va en minúsculas,
--  sin espacios ni tildes. Ejemplo:
-- insert into public.invitados (codigo, nombre, cupo) values
--   ('familia-garcia', 'Familia García', 4),
--   ('laura-mendez',   'Laura Méndez',   1);
--
--  Total de personas confirmadas:
-- select sum(cantidad) from public.confirmaciones where asiste;
-- =====================================================================
