// All validation rules live here, so the route file stays short.

export const STATUSES = ['active', 'completed', 'on_hold'];

export function isValidStatus(status) {
  return STATUSES.includes(status);
}

// True only for a real calendar date written as YYYY-MM-DD.
// The round trip through Date catches impossible dates such as 2026-02-30,
// which JavaScript would otherwise silently roll over to 2 March.
function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// A real number that is zero or more. Rejects strings, NaN and Infinity.
function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

// Checks the body of POST /api/projects.
// Returns { errors, project }:
//   errors  - one message per invalid field, e.g. { budget: '...' }
//   project - the cleaned values, ready to insert (only use when errors is empty)
export function validateProject(body) {
  const input = body ?? {};
  const errors = {};

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title) {
    errors.title = 'Title is required and cannot be empty.';
  }

  if (!isValidStatus(input.status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  }

  // A deadline is optional: missing or null both mean "no deadline".
  const deadline = input.deadline ?? null;
  if (deadline !== null && !isValidDateString(deadline)) {
    errors.deadline = 'Deadline must be a valid date in YYYY-MM-DD format, or null.';
  }

  if (!isNonNegativeNumber(input.budget)) {
    errors.budget = 'Budget is required and must be a number greater than or equal to 0.';
  }

  if (!isNonNegativeNumber(input.spentAmount)) {
    errors.spentAmount = 'Spent amount is required and must be a number greater than or equal to 0.';
  }

  return {
    errors,
    project: {
      title,
      status: input.status,
      deadline,
      budget: input.budget,
      spentAmount: input.spentAmount,
    },
  };
}
