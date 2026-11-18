import { useState } from 'react';
import { createProject } from '../api.js';
import { STATUSES } from '../utils.js';

const emptyForm = {
  title: '',
  status: 'active',
  deadline: '',
  budget: '',
  spentAmount: '',
};

// An empty box becomes null (so the server replies "required"),
// anything else becomes a real number.
function toNumberOrNull(text) {
  return text.trim() === '' ? null : Number(text);
}

// Form with all five project fields.
// The browser does not validate anything here on purpose: the server is the
// single source of truth, and this form shows whatever error it returns.
export default function AddProjectForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(''); // the server's main message
  const [fieldErrors, setFieldErrors] = useState({}); // one message per field

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await createProject({
        title: form.title,
        status: form.status,
        deadline: form.deadline || null, // empty date box -> no deadline
        budget: toNumberOrNull(form.budget),
        spentAmount: toNumberOrNull(form.spentAmount),
      });
      setForm(emptyForm);
      onCreated();
    } catch (err) {
      // Show the server's rejection, and keep what the user typed.
      setError(err.message);
      setFieldErrors(err.details || {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>Add project</h2>

      {error && (
        <p className="message message-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" value={form.title} onChange={handleChange} />
          {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {fieldErrors.status && <p className="field-error">{fieldErrors.status}</p>}
        </div>

        <div className="field">
          <label htmlFor="deadline">Deadline (optional)</label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
          />
          {fieldErrors.deadline && <p className="field-error">{fieldErrors.deadline}</p>}
        </div>

        <div className="field">
          <label htmlFor="budget">Budget (₹)</label>
          <input
            id="budget"
            name="budget"
            type="number"
            value={form.budget}
            onChange={handleChange}
          />
          {fieldErrors.budget && <p className="field-error">{fieldErrors.budget}</p>}
        </div>

        <div className="field">
          <label htmlFor="spentAmount">Amount spent (₹)</label>
          <input
            id="spentAmount"
            name="spentAmount"
            type="number"
            value={form.spentAmount}
            onChange={handleChange}
          />
          {fieldErrors.spentAmount && <p className="field-error">{fieldErrors.spentAmount}</p>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save project'}
        </button>
        <button type="button" className="button button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
