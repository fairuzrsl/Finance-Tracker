# Finance Tracker

A production-ready personal finance tracking web application built with vanilla HTML, CSS, JavaScript and Supabase.

## Features

- User authentication (signup/login via Supabase Auth)
- CRUD transactions with income/expense categorization
- CRUD categories (separate income and expense)
- Auto-suggest categories from existing records
- Editable opening balance (persisted)
- Budget calculation based on income percentage
- Real-time balance updates
- Monthly carry-forward logic
- Expense breakdown visualization
- Mobile-first, professional fintech UI
- PWA support (installable, offline fallback)

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript (ES modules)
- **Backend:** Supabase (Auth + Postgres + Realtime)
- **No frameworks or UI libraries**

## Setup

### 1. Supabase Project

Create a Supabase project at [supabase.com](https://supabase.com).

### 2. Database Schema

Run the SQL files in order in the Supabase SQL Editor:

1. `sql/schema.sql` - Creates tables and indexes
2. `sql/policies.sql` - Enables RLS and creates access policies

### 3. Configuration

Update `js/config.js` with your Supabase project URL and anon key.

### 4. Serve

Serve the `finance-tracker/` directory with any static file server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .
```

Open `http://localhost:8080` in your browser.

## Project Structure

```
finance-tracker/
  index.html          - App shell, auth screen, dashboard, modals
  manifest.json       - PWA metadata
  service-worker.js   - Offline caching
  css/
    reset.css         - Browser reset
    variables.css     - Design tokens
    layout.css        - App layout, header, nav, modals
    components.css    - Buttons, cards, forms, lists
    responsive.css    - Tablet/desktop breakpoints
  js/
    main.js           - Entry point, boot, global events
    config.js         - Supabase URL/key, app constants
    supabaseClient.js - Supabase client initialization
    auth.js           - Signup, login, logout, session
    api.js            - Supabase CRUD functions
    state.js          - Central app state
    calculations.js   - Financial calculations
    ui.js             - DOM rendering, modals, toasts
    transactions.js   - Transaction CRUD + UI bindings
    categories.js     - Category CRUD + UI bindings
    settings.js       - Settings persistence
    pwa.js            - Service worker registration
  sql/
    schema.sql        - Table definitions
    policies.sql      - Row-level security policies
```

## Financial Logic

- `current_balance = opening_balance + total_income - total_expenses`
- Budget = monthly income x budget_percentage
- Monthly carry-forward: closing balance becomes next month's opening balance
