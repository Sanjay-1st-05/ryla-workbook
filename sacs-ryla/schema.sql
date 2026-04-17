-- ============================================================
-- SACS RYLA Design Thinking Workbook — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS workbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,               -- browser-generated session token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Phase 1: Explore
  dc_title TEXT,
  dc_org TEXT,
  dc_context TEXT,
  steep_s TEXT,
  steep_t TEXT,
  steep_e TEXT,
  steep_en TEXT,
  steep_p TEXT,
  steep_synth TEXT,
  matrix_hi_uncertain TEXT,
  matrix_hi_likely TEXT,
  matrix_lo_uncertain TEXT,
  matrix_lo_likely TEXT,
  hmw_issues TEXT,
  hmw_1 TEXT,
  hmw_2 TEXT,
  hmw_3 TEXT,
  hmw_final TEXT,

  -- Phase 2: Empathise
  em_think TEXT,
  em_see TEXT,
  em_hear TEXT,
  em_say TEXT,
  em_pain TEXT,
  em_gain TEXT,
  int_name TEXT,
  int_age TEXT,
  int_prof TEXT,
  int_date TEXT,
  int_bg TEXT,
  int_hobbies TEXT,
  int_notes TEXT,
  int_memorable TEXT,
  int_needs TEXT,
  per_name TEXT,
  per_demo TEXT,
  per_demo2 TEXT,
  per_goals TEXT,
  per_pain TEXT,
  per_needs TEXT,
  sh_hi_lo TEXT,
  sh_hi_hi TEXT,
  sh_lo_lo TEXT,
  sh_lo_hi TEXT,

  -- Phase 3: Experiment
  sc_substitute TEXT,
  sc_combine TEXT,
  sc_adapt TEXT,
  sc_modify TEXT,
  sc_put TEXT,
  sc_eliminate TEXT,
  sc_reverse TEXT,
  rp_behaviours TEXT,
  rp_challenges TEXT,
  rp_aspirations TEXT,
  rp_criteria TEXT,
  rp_need TEXT,
  c1_name TEXT,
  c1_desc TEXT,
  c2_name TEXT,
  c2_desc TEXT,
  c_final TEXT,

  -- Phase 4: Engage
  sb_title TEXT,
  sb_begin TEXT,
  sb_begin_scene TEXT,
  sb_middle TEXT,
  sb_middle_scene TEXT,
  sb_end TEXT,
  sb_end_scene TEXT,
  narrative TEXT,
  key_messages TEXT,
  eng_audience TEXT,
  eng_how TEXT,
  eng_questions TEXT,

  -- Phase 5: Evolve
  ev_idea TEXT,
  ev_objective TEXT,
  ev_lead TEXT,
  ev_resources TEXT,
  ev_date TEXT,
  qw_what TEXT,
  qw_success TEXT,
  qw_steps TEXT,
  qw_comms TEXT,
  imp_social_ind TEXT,
  imp_social_stake TEXT,
  imp_stake_ind TEXT,
  imp_stake_stake TEXT,
  imp_sustain_ind TEXT,
  imp_sustain_stake TEXT,
  imp_scale_ind TEXT,
  imp_scale_stake TEXT,
  mars_m TEXT,
  mars_a TEXT,
  mars_r TEXT,
  mars_s TEXT,
  syn_challenge TEXT,
  syn_persona TEXT,
  syn_needs TEXT,
  syn_solution TEXT,
  syn_user_value TEXT,
  syn_org_value TEXT,
  syn_pain TEXT,
  syn_gain TEXT
);

-- Auto-update updated_at on every save
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workbooks_updated_at
  BEFORE UPDATE ON workbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Allow anonymous read/write (no auth required — session_id is the key)
ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all by session" ON workbooks
  FOR ALL USING (true) WITH CHECK (true);
