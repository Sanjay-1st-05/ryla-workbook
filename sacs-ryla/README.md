# SACS RYLA — Design Thinking Workbook

A premium interactive Design Thinking workbook with Supabase backend, deployable to Vercel.

## Tech Stack

- **Frontend**: Vanilla HTML / CSS / JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

---

## 🚀 Deployment Guide (Step-by-Step)

### Step 1 — Set up Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com) and create a free account
2. Click **New Project**, choose a name (e.g. `ryla-workbook`) and set a DB password
3. Once the project is ready, go to **SQL Editor → New Query**
4. Copy the entire contents of `schema.sql` and paste it, then click **Run**
5. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`

---

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — SACS RYLA Workbook"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sacs-ryla-workbook.git
git push -u origin main
```

---

### Step 3 — Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `sacs-ryla-workbook` repository
4. Before deploying, click **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `SUPABASE_URL` | `https://your-project-id.supabase.co` |
   | `SUPABASE_ANON_KEY` | `your-anon-public-key` |

5. Click **Deploy** — Vercel will build and host your app automatically

6. Your app will be live at: `https://sacs-ryla-workbook.vercel.app`

---

### Step 4 — Test It

1. Open your live URL
2. Fill in some fields and watch the **"Saving…"** indicator in the bottom-left of the sidebar
3. Refresh the page — your data should be restored automatically
4. Check Supabase → **Table Editor → workbooks** to see saved rows

---

## 📁 Project Structure

```
sacs-ryla/
├── index.html          # Main app (all 5 phases)
├── css/
│   └── style.css       # All styling (dark editorial theme)
├── js/
│   └── app.js          # Session, autosave, navigation logic
├── api/
│   └── workbook.js     # Vercel serverless — GET/POST to Supabase
├── schema.sql          # Run this in Supabase SQL editor first
├── vercel.json         # Vercel routing config
├── package.json        # Dependencies
├── .env.example        # Template for environment variables
└── .gitignore
```

---

## 🔑 How It Works

- When a user first opens the app, a **unique session ID** is generated and stored in `localStorage`
- Every input change triggers an **autosave** (debounced 1.2s) via `POST /api/workbook`
- On page load, the app fetches saved data via `GET /api/workbook?session_id=...`
- The Vercel serverless function upserts the data into Supabase

---

## 🛠 Local Development

```bash
npm install
cp .env.example .env
# Fill in your SUPABASE_URL and SUPABASE_ANON_KEY in .env
npx vercel dev
```

Open `http://localhost:3000`

---

## Customisation

- **Colors / Fonts**: Edit CSS variables in `css/style.css` (`:root` block)
- **Add fields**: Add a `data-field="field_name"` attribute to any input, and add the column to `schema.sql`
- **Branding**: Update the sidebar brand in `index.html`
