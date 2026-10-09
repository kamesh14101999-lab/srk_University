import { useEffect, useState } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import FormField, { inputClass } from './FormField';
import FilterBar from './FilterBar';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';

// A reusable table + modal-form CRUD screen for simple reference-data resources.
// formFields: [{ name, label, type: 'text'|'number'|'date'|'select'|'textarea'|'checkbox', options, required }]
export default function CrudManager({
  title,
  api,
  columns,
  formFields = [],
  filterFields = [],
  readOnly = false,
  extraParams = {},
  onRowClick,
}) {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const sortParams = sortBy ? { sort: sortBy, order: sortDir } : {};
      const data = await api.list({ page, limit: 20, ...filters, ...sortParams, ...extraParams });
      setItems(data.items || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, JSON.stringify(filters), JSON.stringify(extraParams), sortBy, sortDir]);

  function openCreate() {
    const initial = {};
    formFields.forEach((f) => {
      initial[f.name] = f.type === 'checkbox' ? false : '';
    });
    setFormValues(initial);
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    const initial = {};
    formFields.forEach((f) => {
      let value = f.path ? f.path.split('.').reduce((o, k) => o?.[k], row) : row[f.name];
      if (value && typeof value === 'object') {
        // Populated relation (e.g. department: { _id, name }) — the form needs just the id.
        value = value._id ?? '';
      } else if (f.type === 'date' && value) {
        // Native date inputs need yyyy-MM-dd; the API returns a full ISO datetime string.
        value = String(value).slice(0, 10);
      }
      initial[f.name] = value ?? (f.type === 'checkbox' ? false : '');
    });
    setFormValues(initial);
    setEditing(row);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.update(editing._id, formValues);
        showToast(`${title} updated`);
      } else {
        await api.create(formValues);
        showToast(`${title} created`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.remove(deleting._id);
      showToast(`${title} deleted`);
      setDeleting(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setDeleting(null);
    }
  }

  const tableColumns = readOnly
    ? columns
    : [
        ...columns,
        {
          key: '__actions',
          header: '',
          render: (row) => (
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(row);
                }}
                className="text-primary-600 hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleting(row);
                }}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ),
        },
      ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {!readOnly && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + Add {title}
          </button>
        )}
      </div>

      {filterFields.length > 0 && (
        <FilterBar
          fields={filterFields}
          values={filters}
          onChange={(v) => {
            setPage(1);
            setFilters(v);
          }}
        />
      )}

      <Table
        columns={tableColumns}
        rows={items}
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage={`No ${title.toLowerCase()} found`}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />
      <Pagination page={page} pages={pages} total={total} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${title}` : `Add ${title}`}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
              Cancel
            </button>
            <button
              type="submit"
              form="crud-manager-form"
              disabled={saving}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <form id="crud-manager-form" onSubmit={handleSubmit} className="space-y-4">
          {formFields.map((field) => (
            <FormField key={field.name} label={field.label} required={field.required}>
              {field.type === 'select' ? (
                <select
                  className={inputClass}
                  required={field.required}
                  value={formValues[field.name] ?? ''}
                  onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className={inputClass}
                  rows={3}
                  required={field.required}
                  value={formValues[field.name] ?? ''}
                  onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              ) : field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={!!formValues[field.name]}
                  onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.checked }))}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className={inputClass}
                  required={field.required}
                  value={formValues[field.name] ?? ''}
                  onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              )}
            </FormField>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${title}?`}
        message="This action cannot be undone. Related records may block deletion."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
