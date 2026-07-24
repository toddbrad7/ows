-- ─── Migration 004: Homepage content cards + social link (v4.2) ──────────────
-- Adds admin-editable copy for the 3 (now 4) homepage info cards and Instagram link.
-- Safe to run anytime — pure inserts with conflict-do-nothing.

insert into site_settings (key, value) values
  ('phil1_icon',    '📖'),
  ('phil1_headline','Know Your Cellar'),
  ('phil1_body',    'Every bottle, tracked — origin, drink window, storage location, and the story behind it.'),

  ('phil2_icon',    '🧬'),
  ('phil2_headline','Know Your Palate'),
  ('phil2_body',    'WSET-standard tasting profiles built from what you''ve actually consumed, not guesswork.'),

  ('phil3_icon',    '🤖'),
  ('phil3_headline','Know What''s Next'),
  ('phil3_body',    'An AI sommelier that reasons over your real taste profile, your budget, and your cellar.'),

  ('phil4_icon',    '🍷'),
  ('phil4_headline','Wine Club'),
  ('phil4_body',    'Join our wine club for curated selections delivered to your door.'),
  ('phil4_link',    ''),

  ('instagram_url', 'https://instagram.com/taddernet_sauvignon')
on conflict (key) do nothing;
