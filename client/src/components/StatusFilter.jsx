import { STATUSES } from '../utils.js';

// Dropdown that picks which status to show. '' means all statuses.
export default function StatusFilter({ value, onChange }) {
  return (
    <div className="filter">
      <label htmlFor="status-filter">Filter by status</label>
      <select id="status-filter" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All statuses</option>
        {STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}
