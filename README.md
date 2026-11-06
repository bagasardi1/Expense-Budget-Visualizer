# Expense & Budget Visualizer

A modern, responsive financial dashboard for tracking daily expenses, monitoring spending habits, and visualizing budget distribution — built entirely with Vanilla JavaScript, no frameworks required.

---

## Features

### Core (MVP)
- **Dashboard Summary** — Total expenses, total transactions, and highest spending category updated in real time.
- **Add Transaction Form** — Input item name, amount (IDR), category, and date with full client-side validation.
- **Transaction List** — View all transactions with name, amount, category, date, and a delete button.
- **Spending Distribution Chart** — Doughnut chart (Chart.js) showing category breakdown with percentages.

### Optional
- **Monthly Summary** — Filter transactions by month/year with category breakdown bars.
- **Sort Transactions** — Sort by newest, oldest, highest amount, lowest amount, or category A–Z.
- **Dark / Light Mode** — Toggleable theme that persists across sessions via LocalStorage.

---

## Technology Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| Markup      | HTML5 (semantic)                      |
| Styling     | CSS3 with custom properties           |
| Logic       | Vanilla JavaScript ES6+ (`'use strict'`) |
| Charts      | [Chart.js 4.4.0](https://www.chartjs.org/) via CDN |
| Icons       | [Lucide Icons](https://lucide.dev/) via CDN |
| Fonts       | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Persistence | Browser `localStorage` API            |

---

## Folder Structure

```
Expense-Budget-Visualizer/
│
├── .kiro/
│   ├── specs/
│   │   ├── requirements.md   ← Functional & non-functional requirements
│   │   ├── design.md         ← Architecture, layout & color system
│   │   └── tasks.md          ← Implementation checklist
│   └── steering/
│
├── index.html                ← Single HTML entry point
├── css/
│   └── style.css             ← All styles (CSS variables + responsive)
├── js/
│   └── script.js             ← All application logic
└── README.md
```

---

## How to Run Locally

1. **Clone or download** the repository.
2. Open the `Expense-Budget-Visualizer/` folder.
3. Double-click `index.html` **or** open it in any modern browser.

> No build tools, no dependencies to install, no server needed. It works straight from the file system.

**Recommended browsers:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

## How LocalStorage Works

All data is stored client-side in two keys:

| Key                  | Contents                                        |
|----------------------|-------------------------------------------------|
| `ebv_transactions`   | JSON array of all transaction objects           |
| `ebv_theme`          | String `"light"` or `"dark"`                   |

**Transaction data model:**
```json
{
  "id": "lcc3ab2_x9k1f",
  "name": "Lunch at warung",
  "amount": 25000,
  "category": "Food",
  "date": "2026-11-06"
}
```

Data is read on page load and written on every add/delete. Refreshing the page will restore all saved transactions and the selected theme. Corrupt or missing data is handled gracefully — the app starts fresh without errors.

---

## How to Deploy on GitHub Pages

1. **Push the project to a GitHub repository.**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Expense & Budget Visualizer"
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository → **Settings** → **Pages**.
   - Under *Source*, select **Deploy from a branch**.
   - Choose **main** branch and **/ (root)** folder.
   - Click **Save**.

3. Your site will be live at:
   ```
   https://<username>.github.io/<repo-name>/Expense-Budget-Visualizer/
   ```

> All assets use relative paths and CDN links, so the app works without any server-side configuration.

---

## Currency Format

All monetary values are displayed in **Indonesian Rupiah (IDR)** using the `id-ID` locale:

| Raw Value | Displayed Value |
|-----------|-----------------|
| 25000     | Rp 25.000       |
| 150000    | Rp 150.000      |
| 1500000   | Rp 1.500.000    |

---

## License

MIT — free to use and modify.
