# Tasks — Expense & Budget Visualizer

## Phase 1: Project Scaffolding
- [x] Create directory structure (css/, js/, .kiro/specs/, .kiro/steering/)
- [x] Create requirements.md
- [x] Create design.md
- [x] Create tasks.md

## Phase 2: HTML Structure (index.html)
- [x] Document head: meta, title, CDN links (Chart.js, Lucide, Google Fonts)
- [x] Header: logo, app name, current date, theme toggle button
- [x] Hero section: welcome heading + subtitle
- [x] Summary stat cards: Total Expenses, Total Transactions, Highest Category
- [x] Content grid: Chart panel + Add Transaction Form panel
- [x] Monthly Summary section
- [x] Transaction list section: sort controls + list container
- [x] Footer
- [x] Toast notification element

## Phase 3: CSS Styling (css/style.css)
- [x] CSS variables for light and dark themes
- [x] Base reset and typography
- [x] Header styles
- [x] Hero section styles
- [x] Stat cards grid
- [x] Chart panel and form panel (2-col grid)
- [x] Form styles (inputs, labels, button, validation messages)
- [x] Transaction list styles (rows, delete button, empty state)
- [x] Monthly summary styles
- [x] Toast notification styles
- [x] Dark mode overrides
- [x] Responsive media queries (tablet + mobile)
- [x] Hover/transition effects

## Phase 4: JavaScript Logic (js/script.js)
- [x] State object definition
- [x] initializeApp()
- [x] loadTransactions() + saveTransactions()
- [x] formatCurrency() + generateId()
- [x] validateForm()
- [x] addTransaction() with form event listener
- [x] deleteTransaction() with confirmation
- [x] calculateTotalExpenses() + calculateCategoryTotals()
- [x] updateDashboard() with recent transactions
- [x] renderTransactions() with sort support
- [x] sortTransactions()
- [x] updateChart() (doughnut, Chart.js)
- [x] renderMonthlySummary()
- [x] toggleTheme() with LocalStorage persistence
- [x] showToast()
- [x] Set current date in header
- [x] Initialize month selector to current month

## Phase 5: README.md
- [x] Project name + description
- [x] Features list
- [x] Tech stack
- [x] Folder structure
- [x] How to run locally
- [x] LocalStorage explanation
- [x] GitHub Pages deployment guide

## Phase 6: Verification
- [x] All 15 acceptance criteria checked
- [x] No console errors
- [x] Responsive on mobile
- [x] Dark mode persists on refresh
