-- ═══════════════════════════════════════════════════════════════════════════
-- ONE-TIME DATA MIGRATION
-- Assigns all existing wines/events/locations to the 'toddbrad' account and
-- flags it as admin. Run this ONLY after openwinesociety@gmail.com has signed up.
-- ═══════════════════════════════════════════════════════════════════════════
do $$
declare target_uid uuid;
begin
  select id into target_uid from auth.users where email = 'openwinesociety@gmail.com';
  if target_uid is null then
    raise exception 'No user found with openwinesociety@gmail.com — sign up with that email first, then re-run this block.';
  end if;
  update wines             set user_id = target_uid where user_id is null;
  update tasting_events    set user_id = target_uid where user_id is null;
  update storage_locations set user_id = target_uid where user_id is null;
  update profiles set is_admin = true where id = target_uid;
end $$;
