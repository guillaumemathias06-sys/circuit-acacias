-- Bug : award_points_for_competition recalculait le classement avant que la compétition
-- passe au statut 'finished', alors que recalculate_rankings ne prend en compte que les
-- compétitions 'finished'. Les résultats juste saisis étaient donc ignorés du classement
-- jusqu'à la saisie d'une compétition suivante.
-- Fix : on passe la compétition à 'finished' à l'intérieur de la fonction, avant le recalcul.

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

  -- Marquer la compétition comme terminée AVANT le recalcul du classement,
  -- sinon recalculate_rankings (qui filtre status='finished') ignore ses résultats.
  update competitions set status = 'finished' where id = p_competition_id;

  declare
    v_season_id uuid;
    v_category_id uuid;
  begin
    select season_id, category_id into v_season_id, v_category_id
    from competitions where id = p_competition_id;

    perform recalculate_rankings(v_season_id, v_category_id);
  end;
end $$;
