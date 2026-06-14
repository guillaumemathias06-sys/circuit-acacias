-- Fonction de recalcul du classement Circuit Acacias

create or replace function recalculate_rankings(p_season_id uuid, p_category_id uuid)
returns void language plpgsql security definer as $$
declare
  v_retained int;
  v_competition record;
  v_player record;
  v_points_sum int;
  v_points_arr int[];
  v_retained_sum int;
  v_played int;
begin
  -- Pour chaque joueur ayant des résultats dans cette catégorie/saison
  for v_player in
    select distinct r.user_id
    from results r
    join competitions c on c.id = r.competition_id
    where c.season_id = p_season_id
      and c.category_id = p_category_id
      and c.points_enabled = true
      and c.status = 'finished'
  loop
    -- Récupérer le nombre de résultats retenus (max parmi les compétitions)
    select coalesce(max(retained_results), 6) into v_retained
    from competitions
    where season_id = p_season_id and category_id = p_category_id;

    -- Récupérer tous les points du joueur, triés desc
    select array_agg(r.points_awarded order by r.points_awarded desc),
           count(*)::int
    into v_points_arr, v_played
    from results r
    join competitions c on c.id = r.competition_id
    where r.user_id = v_player.user_id
      and c.season_id = p_season_id
      and c.category_id = p_category_id
      and c.points_enabled = true
      and c.status = 'finished';

    -- Somme des meilleurs résultats retenus
    select coalesce(sum(pts), 0) into v_retained_sum
    from (
      select unnest(v_points_arr[1:v_retained]) as pts
    ) sub;

    -- Somme totale
    select coalesce(sum(pts), 0) into v_points_sum
    from unnest(v_points_arr) pts;

    -- Upsert du classement
    insert into rankings (season_id, category_id, user_id, total_points, retained_points, competitions_played)
    values (p_season_id, p_category_id, v_player.user_id, v_points_sum, v_retained_sum, v_played)
    on conflict (season_id, category_id, user_id)
    do update set
      total_points = excluded.total_points,
      retained_points = excluded.retained_points,
      competitions_played = excluded.competitions_played,
      updated_at = now();
  end loop;

  -- Mettre à jour les rangs
  with ranked as (
    select id, row_number() over (order by retained_points desc, total_points desc) as new_rank
    from rankings
    where season_id = p_season_id and category_id = p_category_id
  )
  update rankings r set rank = ranked.new_rank
  from ranked where ranked.id = r.id;

end $$;

-- Fonction d'attribution des points après saisie des résultats
create or replace function award_points_for_competition(p_competition_id uuid)
returns void language plpgsql security definer as $$
declare
  v_result record;
  v_points int;
  v_scale_id uuid;
begin
  select points_scale_id into v_scale_id from competitions where id = p_competition_id;

  for v_result in
    select * from results where competition_id = p_competition_id
  loop
    if v_result.wo or v_result.forfait then
      v_points := 0;
    else
      select points into v_points
      from points_scale_rows
      where points_scale_id = v_scale_id
        and v_result.final_position between position_min and position_max
      limit 1;
    end if;

    update results set points_awarded = coalesce(v_points, 0)
    where id = v_result.id;
  end loop;

  -- Recalculer le classement
  declare
    v_season_id uuid;
    v_category_id uuid;
  begin
    select season_id, category_id into v_season_id, v_category_id
    from competitions where id = p_competition_id;

    perform recalculate_rankings(v_season_id, v_category_id);
  end;
end $$;
