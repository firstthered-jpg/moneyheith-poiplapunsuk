# Phase 1 Implementation Plan

## 🎯 Objective
Build Daily Metrics, Expense Analysis, Month-to-Month Compare, and Trend Charts

---

## 📁 Files to Create/Modify

### New Pages
```
app/analytics/
├── page.tsx                (Main Analytics Dashboard)
├── daily-metrics/
│   └── page.tsx           (Daily Metrics Details)
├── compare/
│   └── page.tsx           (Month vs Month Compare)
└── trends/
    └── page.tsx           (Trend Analysis)
```

### New Components
```
components/
├── analytics/
│   ├── DailyMetricsCard.tsx      (Show daily stats)
│   ├── ExpenseBreakdown.tsx       (Top 5 expenses pie/bar)
│   ├── MonthCompare.tsx           (Side-by-side months)
│   ├── TrendChart.tsx             (Line chart trends)
│   └── HealthScore.tsx            (0-100 score)
```

### New Utilities
```
lib/
├── analytics.ts            (Analytics calculations)
└── queries.ts              (Supabase queries)
```

---

## 🗄️ Database Queries Needed

### Query 1: Get Daily Summary
```sql
-- Get revenue, expenses, profit for each day
SELECT 
  DATE(date) as day,
  SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as revenue,
  SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses,
  SUM(CASE WHEN type='income' THEN amount ELSE -amount END) as profit,
  COUNT(*) as transaction_count
FROM transactions
WHERE DATE(date) >= DATE(NOW()) - INTERVAL '30 days'
GROUP BY DATE(date)
ORDER BY DATE(date) DESC;
```

### Query 2: Get Top Expenses
```sql
-- Get top 5 highest expenses
SELECT 
  category,
  description,
  amount,
  date
FROM transactions
WHERE type='expense'
  AND DATE(date) >= DATE(NOW()) - INTERVAL '30 days'
ORDER BY amount DESC
LIMIT 5;
```

### Query 3: Get Expense by Category
```sql
-- Group expenses by category for current month
SELECT 
  category,
  SUM(amount) as total,
  COUNT(*) as count,
  AVG(amount) as avg_amount
FROM transactions
WHERE type='expense'
  AND DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW())
GROUP BY category
ORDER BY total DESC;
```

### Query 4: Compare Months
```sql
-- Compare current month vs previous month
WITH current_month AS (
  SELECT 
    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as revenue,
    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
  FROM transactions
  WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW())
),
previous_month AS (
  SELECT 
    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as revenue,
    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
  FROM transactions
  WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
)
SELECT * FROM current_month, previous_month;
```

---

## 🎨 Component Structure

### DailyMetricsCard.tsx
```
┌─────────────────────────┐
│ วันนี้                   │
├─────────────────────────┤
│ รายได้:      ฿5,500     │
│ ค่าใช้จ่าย:   ฿1,200     │
│ กำไร:        ฿4,300 ⬆️  │
│ Margin:      78.2%       │
└─────────────────────────┘
```

### ExpenseBreakdown.tsx
```
Pie Chart: Expenses by Category
- Food: 35%
- Salary: 30%
- Rent: 20%
- Other: 15%
```

### MonthCompare.tsx
```
Month vs Month Comparison
                Current    Previous   Change
Revenue         ฿150,000   ฿120,000   +25%
Expenses        ฿50,000    ฿55,000    -9%
Profit          ฿100,000   ฿65,000    +54%
Margin          66.7%      54.2%      +12.5%
```

### TrendChart.tsx
```
Line Chart:
- Blue line: Revenue trend
- Red line: Expense trend
- Green area: Profit range
Last 30 days
```

---

## 📊 Step-by-Step Implementation

### Step 1: Create Analytics Utils
- getDailyMetrics(date)
- getMonthlyComparison(month1, month2)
- calculateTrend(transactions)
- getExpenseBreakdown(month)

### Step 2: Create Supabase Queries (lib/queries.ts)
- fetchDailyData(dateRange)
- fetchExpenseBreakdown(month)
- fetchMonthlyStats(month)
- fetchTrendData(days)

### Step 3: Create Analytics Pages
- /analytics - Main dashboard
- /analytics/daily-metrics - Details
- /analytics/compare - Month comparison
- /analytics/trends - Trend analysis

### Step 4: Create Components
- DailyMetricsCard
- ExpenseBreakdown (Pie Chart)
- MonthCompare (Table)
- TrendChart (Line Chart)
- HealthScore

### Step 5: Update Navigation
- Add "Analytics" link to header
- Create sidebar with sub-pages

### Step 6: Test
- Load sample data
- Verify calculations
- Check responsive design

---

## 📈 Data Flow

```
Supabase (Database)
    ↓
lib/queries.ts (SQL Queries)
    ↓
lib/analytics.ts (Calculations)
    ↓
useFinanceStore (State Management)
    ↓
Components (UI Display)
    ↓
Charts & Cards
```

---

## 🎯 Success Criteria

- ✅ Daily metrics show correct revenue/expenses/profit
- ✅ Expense breakdown pie chart displays top 5
- ✅ Month comparison calculates % change correctly
- ✅ Trend chart shows 30-day history
- ✅ All charts responsive on mobile
- ✅ Data updates when adding transactions
- ✅ Loading states work smoothly

---

## ⏱️ Estimated Timeline

| Task | Time | Priority |
|------|------|----------|
| Create queries | 1 day | 🔴 High |
| Create utils | 1 day | 🔴 High |
| Create components | 2 days | 🔴 High |
| Create pages | 1 day | 🔴 High |
| Testing & Polish | 1 day | 🟡 Medium |

**Total: ~1 week**

---

## 🚀 Ready to Build?

Start with: `/analytics` main page
