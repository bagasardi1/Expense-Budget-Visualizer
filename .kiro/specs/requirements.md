# Requirements — Expense & Budget Visualizer

## Functional Requirements

### FR-1: Dashboard Summary
- FR-1.1: Display total expenses (sum of all transaction amounts) in IDR format.
- FR-1.2: Display total number of transactions.
- FR-1.3: Display the highest-spending category.
- FR-1.4: Display the most recent transactions.
- FR-1.5: All summary values must update automatically when transactions are added or deleted.

### FR-2: Add Transaction Form
- FR-2.1: Form fields: Item Name (text), Amount (number), Category (select), Date (date).
- FR-2.2: Default categories: Food, Transport, Fun.
- FR-2.3: Date field defaults to today's date.
- FR-2.4: Validate all required fields before submission.
- FR-2.5: Reject amounts ≤ 0.
- FR-2.6: Show user-friendly error/validation messages.
- FR-2.7: Clear the form after successful submission.
- FR-2.8: On successful submission: generate unique ID, save to LocalStorage, update dashboard + list + chart.

### FR-3: Transaction List
- FR-3.1: Display all transactions (name, amount, category, date, delete button).
- FR-3.2: Show newest transactions first by default.
- FR-3.3: Allow individual deletion with confirmation dialog.
- FR-3.4: After deletion, update all stats, chart, and list.
- FR-3.5: Show a friendly empty state when the list is empty.

### FR-4: Spending Distribution Chart
- FR-4.1: Render a Pie or Doughnut chart using Chart.js (CDN).
- FR-4.2: Show spending per category (Food, Transport, Fun).
- FR-4.3: Show labels and percentages.
- FR-4.4: Update automatically on data changes.
- FR-4.5: Handle empty data gracefully.

### FR-5: Monthly Summary (Optional Feature 1)
- FR-5.1: Display total expenses for a selected month/year.
- FR-5.2: Provide a month/year selector.
- FR-5.3: Display transaction count for selected month.
- FR-5.4: Display category breakdown for selected month.
- FR-5.5: Update when month selection changes.

### FR-6: Sort Transactions (Optional Feature 2)
- FR-6.1: Sort by: Highest Amount, Lowest Amount, Category A-Z, Newest Date, Oldest Date.
- FR-6.2: Sorting does not modify original data.

### FR-7: Dark / Light Mode (Optional Feature 3)
- FR-7.1: Default is light mode.
- FR-7.2: Toggle button with icon.
- FR-7.3: Persist theme in LocalStorage.
- FR-7.4: Restore theme on page load.
- FR-7.5: Apply theme to all elements including chart.

### FR-8: Local Storage
- FR-8.1: Persist all transactions in LocalStorage.
- FR-8.2: Persist theme preference.
- FR-8.3: Load data on app start.
- FR-8.4: Handle empty or corrupted JSON gracefully.

## Non-Functional Requirements

- NFR-1: Vanilla HTML5, CSS3, JavaScript only (no frameworks).
- NFR-2: No backend server or database.
- NFR-3: Works in Chrome, Firefox, Edge, Safari.
- NFR-4: Fully responsive (desktop, tablet, mobile).
- NFR-5: IDR currency formatting (e.g. Rp 150.000).
- NFR-6: Semantic HTML5, CSS variables, modular JS.
- NFR-7: No console errors during normal usage.
- NFR-8: GitHub Pages compatible (relative paths, CDN only).
