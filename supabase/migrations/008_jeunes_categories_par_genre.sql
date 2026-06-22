-- Les tournois jeunes ne sont pas mixtes : remplace les 4 catégories "Jeunes X ans" (mixtes)
-- par 8 catégories genrées (Garçons/Filles par tranche d'âge).
-- Déjà appliqué manuellement en production le 2026-06-21 (aucun joueur n'était encore
-- assigné à une catégorie jeunes — migration sans impact sur les données existantes).

delete from categories where gender = 'junior';

insert into categories (name, gender, age_min, active, sort_order) values
  ('Garçons 11/12 ans', 'M', 11, true, 5),
  ('Filles 11/12 ans', 'F', 11, true, 6),
  ('Garçons 13/14 ans', 'M', 13, true, 7),
  ('Filles 13/14 ans', 'F', 13, true, 8),
  ('Garçons 15/16 ans', 'M', 15, true, 9),
  ('Filles 15/16 ans', 'F', 15, true, 10),
  ('Garçons 17/18 ans', 'M', 17, true, 11),
  ('Filles 17/18 ans', 'F', 17, true, 12);
