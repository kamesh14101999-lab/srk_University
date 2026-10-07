import { inputClass } from './FormField';

// fields: [{ key, type: 'text'|'select', placeholder, options: [{value,label}] }]
export default function FilterBar({ fields, values, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
      {fields.map((field) => (
        <div key={field.key} className="min-w-[160px]">
          {field.type === 'select' ? (
            <select
              className={inputClass}
              value={values[field.key] || ''}
              onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
            >
              <option value="">{field.placeholder || 'All'}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className={inputClass}
              placeholder={field.placeholder}
              value={values[field.key] || ''}
              onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
}
