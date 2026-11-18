import {
  STATUSES,
  formatDeadline,
  formatINR,
  isOverBudget,
  isOverdue,
  statusLabel,
} from '../utils.js';

// Shows the project table, or one of the three other states:
// loading, error, or empty.
export default function ProjectList({ projects, loading, error, filter, onRetry, onStatusChange }) {
  if (loading) {
    return <p className="message">Loading projects…</p>;
  }

  if (error) {
    return (
      <div className="message message-error" role="alert">
        <p>Could not load projects. {error}</p>
        <button type="button" className="button button-secondary" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <p className="message">
        {filter
          ? `No projects with the status "${statusLabel(filter)}".`
          : 'No projects yet. Add your first project to get started.'}
      </p>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="project-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Deadline</th>
            <th className="number">Budget</th>
            <th className="number">Spent</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const overdue = isOverdue(project);
            const overBudget = isOverBudget(project);

            return (
              <tr key={project.id} className={overdue ? 'row-overdue' : ''}>
                <td>{project.title}</td>
                <td>
                  <select
                    className={`status-select status-${project.status}`}
                    aria-label={`Status of ${project.title}`}
                    value={project.status}
                    onChange={(event) => onStatusChange(project.id, event.target.value)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={project.deadline ? '' : 'muted'}>
                    {formatDeadline(project.deadline)}
                  </span>
                  {overdue && <span className="badge badge-danger">Overdue</span>}
                </td>
                <td className="number">{formatINR(project.budget)}</td>
                <td className="number">
                  <span className={overBudget ? 'text-danger' : ''}>
                    {formatINR(project.spentAmount)}
                  </span>
                  {overBudget && <span className="badge badge-warning">Over budget</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
