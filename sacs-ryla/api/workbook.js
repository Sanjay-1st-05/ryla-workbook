// api/workbook.js — Vercel Serverless Function
// Handles GET (load) and POST (save) for workbook data via Supabase

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { session_id } = req.method === 'GET'
    ? req.query
    : (req.body || {});

  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  // ── GET: Load existing workbook ──────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('workbooks')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data: data || null });
  }

  // ── POST: Save / upsert workbook ─────────────────────────────────────────
  if (req.method === 'POST') {
    const payload = { ...req.body, session_id };

    // Check if record already exists
    const { data: existing } = await supabase
      .from('workbook')
      .select('id')
      .eq('session_id', session_id)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('workbook')
        .update(payload)
        .eq('session_id', session_id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('workbook')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({ data: result.data, saved: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
