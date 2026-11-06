# Design — Expense & Budget Visualizer

## Technology Stack

| Layer        | Technology                         |
|-------------|-------------------------------------|
| Markup       | HTML5 (semantic)                   |
| Styling      | CSS3 with variables + media queries |
| Logic        | Vanilla JavaScript (ES6+)          |
| Charts       | Chart.js via CDN                   |
| Icons        | Lucide Icons via CDN               |
| Fonts        | Google Fonts — Inter               |
| Persistence  | Browser LocalStorage               |

## Color Palette

| Token                 | Light Mode       | Dark Mode        |
|-----------------------|------------------|------------------|
| --bg-primary          | #f0f4f8          | #0f172a          |
| --bg-secondary        | #ffffff          | #1e293b          |
| --bg-tertiary         | #f8fafc          | #273448          |
| --text-primary        | #1e293b          | #f1f5f9          |
| --text-secondary      | #64748b          | #94a3b8          |
| --accent-primary      | #10b981          | #34d399          |
| --accent-hover        | #059669          | #10b981          |
| --color-food          | #f97316          | #fb923c          |
| --color-transport     | #3b82f6          | #60a5fa          |
| --color-fun           | #a855f7          | #c084fc          |
| --danger              | #ef4444          | #f87171          |
| --border              | #e2e8f0          | #334155          |
| --shadow              | rgba(0,0,0,0.07) | rgba(0,0,0,0.3)  |

## Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  HEADER  (logo | title | date | theme toggle)       │
├─────────────────────────────────────────────────────┤
│  HERO     Welcome heading + subtitle                │
├────────────────────┬────────────────────────────────┤
│  STAT CARDS (3)    │  (responsive grid)             │
│  Total Expenses    │  Total Transactions             │
│  Highest Category  │                                │
├────────────────────┴────────────────────────────────┤
│  CONTENT GRID (2 col desktop, 1 col mobile)         │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  Doughnut Chart  │  │  Add Transaction Form    │ │
│  └──────────────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  MONTHLY SUMMARY                                    │
│  (month selector + stats + category breakdown)      │
├─────────────────────────────────────────────────────┤
│  TRANSACTION LIST                                   │
│  (sort controls + table/list rows)                  │
├─────────────────────────────────────────────────────┤
│  FOOTER                                             │
└─────────────────────────────────────────────────────┘
```

## JavaScript Module Structure

### State
```js
state = {
  transactions: [],   // loaded from / saved to LocalStorage
  theme: 'light',     // loaded from / saved to LocalStorage
  sortOption: 'newest',
  selectedMonth: '',  // YYYY-MM
  chart: null         // Chart.js instance
}
```

### Core Functions
| Function                  | Responsibility                              |
|---------------------------|---------------------------------------------|
| initializeApp()           | Bootstrap: load data, set theme, render all |
| loadTransactions()        | Read + parse LocalStorage                   |
| saveTransactions()        | Stringify + write to LocalStorage           |
| addTransaction(data)      | Validate, create, save, refresh UI          |
| deleteTransaction(id)     | Remove by ID, save, refresh UI              |
| calculateTotalExpenses()  | Sum all amounts                             |
| calculateCategoryTotals() | Group and sum by category                   |
| updateDashboard()         | Update stat cards + recent list             |
| renderTransactions()      | Render sorted transaction list              |
| sortTransactions(arr)     | Return sorted copy based on state.sortOption|
| updateChart()             | Destroy + recreate Chart.js instance        |
| renderMonthlySummary()    | Filter by month, show stats + breakdown     |
| toggleTheme()             | Flip theme, save, apply CSS class           |
| formatCurrency(amount)    | Return "Rp X.XXX" formatted string          |
| generateId()              | Return unique timestamp-based ID string     |
| showToast(msg, type)      | Brief success/error notification            |
| validateForm(data)        | Return errors array or empty array          |

## LocalStorage Keys
| Key                        | Value                     |
|----------------------------|---------------------------|
| `ebv_transactions`         | JSON array of transactions|
| `ebv_theme`                | `"light"` or `"dark"`     |

## Transaction Data Model
```json
{
  "id": "1699234567890_abc",
  "name": "Lunch at warung",
  "amount": 25000,
  "category": "Food",
  "date": "2026-11-06"
}
```

## Responsive Breakpoints
| Breakpoint | Layout              |
|------------|---------------------|
| ≥ 1024px   | Desktop: 2-col grid |
| 768–1023px | Tablet: adaptive    |
| < 768px    | Mobile: 1-col stack |
