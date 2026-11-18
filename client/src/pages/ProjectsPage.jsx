// The /projects page. It owns the data and passes it down to the components.
import { useEffect, useState } from 'react';
import { getProjects, updateProjectStatus } from '../api.js';
import AddProjectForm from '../components/AddProjectForm.jsx';
import ProjectList from '../components/ProjectList.jsx';
import StatusFilter from '../components/StatusFilter.jsx';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState(''); // '' means "all statuses"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // the list failed to load
  const [actionError, setActionError] = useState(''); // a status change failed
  const [showForm, setShowForm] = useState(false);
  // Changing this number makes the effect below run again (a manual reload).
  const [reloadCount, setReloadCount] = useState(0);

  // Load the list on first render, when the filter changes, and on reload.
  // The server does the filtering, through ?status=...
  useEffect(() => {
    // If the filter changes again before this request finishes, "ignore"
    // stops the older, slower response from overwriting the newer one.
    let ignore = false;

    setLoading(true);
    setError('');

    getProjects(filter)
      .then((data) => {
        if (!ignore) setProjects(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filter, reloadCount]);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  function handleCreated() {
    setShowForm(false);
    reload();
  }

  async function handleStatusChange(id, status) {
    setActionError('');
    try {
      await updateProjectStatus(id, status);
      // Reload so a project that no longer matches the filter drops out.
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Project Deadline Tracker</h1>
        <button type="button" className="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close form' : 'Add project'}
        </button>
      </header>

      {showForm && <AddProjectForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      <StatusFilter value={filter} onChange={setFilter} />

      {actionError && (
        <p className="message message-error" role="alert">
          {actionError}
        </p>
      )}

      <ProjectList
        projects={projects}
        loading={loading}
        error={error}
        filter={filter}
        onRetry={reload}
        onStatusChange={handleStatusChange}
      />
    </main>
  );
}
