// Small helpers with no React in them, so each rule is easy to read and test.

export const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On hold' },
];

export function statusLabel(value) {
  return STATUSES.find((status) => status.value === value)?.label ?? value;
}

// Today's date in the user's own timezone, as "YYYY-MM-DD".
// (toISOString() is avoided on purpose: it gives the UTC date, which is
// still "yesterday" in India until 5:30 AM.)
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// A project is overdue when its deadline day is fully over and the work is
// not finished.
//  - No deadline        -> never overdue.
//  - Due today          -> not overdue yet (the day has not ended).
//  - Status "completed" -> not overdue (the work is done, nothing is late).
// Both dates are "YYYY-MM-DD" strings, and that format sorts the same way
// as the calendar, so a plain string comparison is correct and no timezone
// conversion can shift the result.
export function isOverdue(project, today = todayString()) {
  if (!project.deadline) return false;
  if (project.status === 'completed') return false;
  return project.deadline < today;
}

// Over budget only when spending EXCEEDS the budget.
// Spending exactly the budget is still within budget.
export function isOverBudget(project) {
  return project.spentAmount > project.budget;
}

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// 120000 -> "₹1,20,000"
export function formatINR(amount) {
  return rupees.format(amount);
}

// "2026-12-15" -> "15 Dec 2026". Null -> "No deadline".
// The date is built from its parts so it is read as a local date, not UTC.
export function formatDeadline(deadline) {
  if (!deadline) return 'No deadline';
  const [year, month, day] = deadline.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
