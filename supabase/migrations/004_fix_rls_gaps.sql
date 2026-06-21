-- Active RLS sur les tables qui avaient des policies créées mais jamais appliquées
-- (sans "enable row level security", les policies sont ignorées : tables ouvertes à tous en lecture/écriture)

alter table categories enable row level security;
alter table masters enable row level security;
alter table points_scales enable row level security;
alter table points_scale_rows enable row level security;
alter table seasons enable row level security;

create policy "Admin all categories" on categories for all using (is_admin());
create policy "Admin all points_scales" on points_scales for all using (is_admin());
create policy "Admin all points_scale_rows" on points_scale_rows for all using (is_admin());
create policy "Admin all seasons" on seasons for all using (is_admin());
