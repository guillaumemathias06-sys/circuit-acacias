-- Bug critique : les pages publiques (classements, masters, compétitions) embarquent
-- `user:users(...)` pour afficher prénom/nom/club des joueurs. Mais la policy RLS sur
-- `users` n'autorise la lecture qu'à auth.uid() = id (ou admin) : pour un visiteur non
-- connecté (ou connecté mais consultant un autre joueur), l'embed renvoie `user: null`.
-- Le classement affiche des rangs et points sans aucun nom.
--
-- Fix : une vue ne contenant que les colonnes non sensibles, dont le propriétaire (postgres)
-- contourne le RLS de la table users pour cette lecture précise. PostgREST détecte la relation
-- vers rankings/results/registrations via la même colonne `id`, donc l'embed `user:public_profiles(...)`
-- fonctionne sans toucher aux policies existantes sur `users` (email, téléphone, licence restent privés).

create view public_profiles as
select id, first_name, last_name, fft_club, fft_ranking, category_id
from users;

grant select on public_profiles to anon, authenticated;
