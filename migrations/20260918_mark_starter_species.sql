-- Apply once to databases that already ran the original setup.sql and seed.sql.
-- The original seed script assigned its 16 examples to the first profile, so
-- author alone cannot distinguish them from records that person created in the app.
begin;

alter table public.species
  add column if not exists is_seed boolean not null default false;

do $$
begin
  if (select count(*) from public.species where is_seed) = 0 then
    if (
      select count(*)
      from public.species as species
      join (values
        (1, 'Cavia porcellus'),
        (2, 'Opuntia ficus-indica'),
        (3, 'Odontodactylus scyllarus'),
        (4, 'Glaucus atlanticus'),
        (5, 'Leuresthes tenuis'),
        (6, 'Cyanocitta stelleri'),
        (7, 'Grimpoteuthis'),
        (8, 'Homo Sapiens'),
        (9, 'Ursus maritimus'),
        (10, 'Panthera uncia'),
        (11, 'Panthera leo'),
        (12, 'Ailuropoda melanoleuca'),
        (13, 'Panthera '),
        (14, 'Psychrolutes marcidus'),
        (15, 'Giraffa'),
        (16, 'Folivora')
      ) as starter(id, scientific_name)
        on species.id = starter.id and species.scientific_name = starter.scientific_name
    ) <> 16 then
      raise exception 'Starter records do not match the original seed.sql; review them before marking.';
    end if;

    update public.species set is_seed = true where id between 1 and 16;
  end if;
end;
$$;

drop policy if exists "Users can insert their own species." on public.species;
drop policy if exists "Users can update their created species." on public.species;
drop policy if exists "Users can delete their created species." on public.species;

create policy "Users can insert their own species." on public.species
  for insert with check (auth.uid() = author and not is_seed);

create policy "Users can update their created species." on public.species
  for update using (auth.uid() = author and not is_seed)
  with check (auth.uid() = author and not is_seed);

create policy "Users can delete their created species." on public.species
  for delete using (auth.uid() = author and not is_seed);

create or replace function public.species_columns_updateable()
returns trigger as $$
begin
  if new.author <> old.author then
    raise exception 'changing species author is not allowed';
  end if;
  if new.is_seed <> old.is_seed then
    raise exception 'changing species starter status is not allowed';
  end if;
  return new;
end;
$$ language plpgsql security definer;

commit;
