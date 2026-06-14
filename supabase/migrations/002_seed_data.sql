-- Données initiales

-- Saison courante
insert into seasons (name, start_date, end_date, active) values
  ('Saison 2026', '2026-01-01', '2026-12-31', true);

-- Catégories
insert into categories (name, gender, sort_order) values
  ('Hommes 4e série', 'M', 1),
  ('Hommes 3e série', 'M', 2),
  ('Femmes', 'F', 3),
  ('Jeunes', 'junior', 4);

-- Barème TMC 8 joueurs
insert into points_scales (name, competition_size) values
  ('TMC 8 joueurs', 8);

-- Récupérer l'id pour les lignes
do $$
declare
  scale8_id uuid;
  scale16_id uuid;
begin
  select id into scale8_id from points_scales where competition_size = 8 limit 1;

  insert into points_scale_rows (points_scale_id, position_min, position_max, points) values
    (scale8_id, 1, 1, 100),
    (scale8_id, 2, 2, 80),
    (scale8_id, 3, 3, 65),
    (scale8_id, 4, 4, 50),
    (scale8_id, 5, 5, 40),
    (scale8_id, 6, 6, 30),
    (scale8_id, 7, 7, 20),
    (scale8_id, 8, 8, 10);

  insert into points_scales (name, competition_size) values ('TMC 16 joueurs', 16);
  select id into scale16_id from points_scales where competition_size = 16 limit 1;

  insert into points_scale_rows (points_scale_id, position_min, position_max, points) values
    (scale16_id, 1, 1, 150),
    (scale16_id, 2, 2, 120),
    (scale16_id, 3, 3, 100),
    (scale16_id, 4, 4, 85),
    (scale16_id, 5, 8, 60),
    (scale16_id, 9, 12, 35),
    (scale16_id, 13, 16, 15);
end $$;
