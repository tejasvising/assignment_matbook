import React from "react";

export default function DynamicField({ field, fieldProps, error }: any) {
  const { name, label, type, placeholder, options } = field;
  const required = field.required;

  const commonLabel = (
    <label className="block text-sm font-medium mb-1">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
  );

  switch (type) {
    case "text":
    case "number":
      return (
        <div>
          {commonLabel}
          <input
            {...fieldProps}
            type={type === "number" ? "number" : "text"}
            placeholder={placeholder}
            className="w-full border p-2 rounded"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        </div>
      );

    case "textarea":
      return (
        <div>
          {commonLabel}
          <textarea {...fieldProps} placeholder={placeholder} className="w-full border p-2 rounded" />
          {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        </div>
      );

    case "select":
      return (
        <div>
          {commonLabel}
          <select {...fieldProps} className="w-full border p-2 rounded">
            <option value="">{placeholder || "Select..."}</option>
            {options?.map((o: any) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        </div>
      );

    case "multi-select":
      return (
        <div>
          {commonLabel}
          <select
            multiple
            value={fieldProps.value}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
              fieldProps.onChange(selected);
            }}
            className="w-full border p-2 rounded"
          >
            {options?.map((o: any) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        </div>
      );

    case "date":
      return (
        <div>
          {commonLabel}
          <input {...fieldProps} type="date" className="w-full border p-2 rounded" />
          {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        </div>
      );

    case "switch":
      return (
        <div className="flex items-center space-x-2">
          <input
            checked={fieldProps.value}
            onChange={(e) => fieldProps.onChange(e.target.checked)}
            type="checkbox"
            id={name}
            className="h-4 w-4"
          />
          <label htmlFor={name}>{label}</label>
          {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
        </div>
      );

    default:
      return <div>Unsupported field: {type}</div>;
  }
}
