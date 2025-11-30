// frontend/src/pages/FormPage.tsx
import React from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchFormSchema, postSubmission } from "../api";

/**
 * DynamicFieldRenderer: render a field (input/select/textarea/multi/switch) given the schema field & the field API.
 * We display:
 *  - field.state.meta.errors (client-side errors from validators)
 *  - serverErrors[fieldName] (errors returned from server after submission)
 */
function DynamicFieldRenderer({ f, field, serverErrors }: any) {
  const value = field.state.value;
  const errors = field.state.meta?.errors || [];
  const serverError = serverErrors?.[f.name];

  const commonLabel = (
    <label className="block text-sm font-medium mb-1">
      {f.label} {f.required && <span className="text-red-600">*</span>}
    </label>
  );

  switch (f.type) {
    case "text":
    case "number":
      return (
        <div>
          {commonLabel}
          <input
            name={field.name}
            value={value ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) =>
              field.handleChange(f.type === "number" ? Number(e.target.value) : e.target.value)
            }
            type={f.type === "number" ? "number" : "text"}
            placeholder={f.placeholder}
            className="w-full border p-2 rounded"
          />
          {(errors.length > 0 || serverError) && (
            <p className="text-sm text-red-600 mt-1">{serverError ?? errors.join(", ")}</p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div>
          {commonLabel}
          <textarea
            name={field.name}
            value={value ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={f.placeholder}
            className="w-full border p-2 rounded"
          />
          {(errors.length > 0 || serverError) && (
            <p className="text-sm text-red-600 mt-1">{serverError ?? errors.join(", ")}</p>
          )}
        </div>
      );

    case "select":
      return (
        <div>
          {commonLabel}
          <select
            name={field.name}
            value={value ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">{f.placeholder ?? "Select..."}</option>
            {f.options?.map((o: any) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {(errors.length > 0 || serverError) && (
            <p className="text-sm text-red-600 mt-1">{serverError ?? errors.join(", ")}</p>
          )}
        </div>
      );

   case "multi-select": {
  const selectedValues = Array.isArray(value) ? value : [];

  const toggleValue = (val: string) => {
    let updated = [...selectedValues];

    if (updated.includes(val)) {
      updated = updated.filter((v) => v !== val);
    } else {
      if (updated.length >= 5) return; // enforce max 5
      updated.push(val);
    }

    field.handleChange(updated);
  };

  return (
    <div>
      {commonLabel}

      <div className="border rounded p-3 space-y-2 max-h-40 overflow-y-auto bg-white">
        {f.options?.map((o: any) => {
          const isChecked = selectedValues.includes(o.value);
          const disableMore = !isChecked && selectedValues.length >= 5;

          return (
            <label key={o.value} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={isChecked}
                disabled={disableMore}
                onChange={() => toggleValue(o.value)}
              />
              <span className={disableMore ? "opacity-40" : ""}>{o.label}</span>
            </label>
          );
        })}
      </div>

      {(errors.length > 0 || serverError) && (
        <p className="text-sm text-red-600 mt-1">{serverError ?? errors.join(", ")}</p>
      )}
    </div>
  );
}


    case "date":
      return (
        <div>
          {commonLabel}
          <input
            name={field.name}
            type="date"
            value={value ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className="w-full border p-2 rounded"
          />
          {(errors.length > 0 || serverError) && (
            <p className="text-sm text-red-600 mt-1">{serverError ?? errors.join(", ")}</p>
          )}
        </div>
      );

    case "switch":
      return (
        <div className="flex items-center space-x-2">
          <input
            name={field.name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => field.handleChange(e.target.checked)}
            onBlur={field.handleBlur}
            className="h-4 w-4"
          />
          <label>{f.label}</label>
          {(errors.length > 0 || serverError) && (
            <p className="text-sm text-red-600 mt-1">{serverError ?? errors.join(", ")}</p>
          )}
        </div>
      );

    default:
      return <div>Unsupported field: {f.type}</div>;
  }
}
function SuccessPopup({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
        <h3 className="text-xl font-semibold text-green-700 mb-2">Success 🎉</h3>
        <p className="text-gray-700">{message}</p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}


export default function FormPage({ onSubmitted }: { onSubmitted?: () => void }) {
  const qc = useQueryClient();
  const [successPopup, setSuccessPopup] = React.useState<string | null>(null);

  // fetch schema using TanStack Query
  const { data: schema, isPending: schemaLoading, isError: schemaError } = useQuery({
    queryKey: ["formSchema"],
    queryFn: fetchFormSchema,
  });

  // server-side submission mutation
  const mutation = useMutation({
    mutationFn: postSubmission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
  });

  // store server validation errors: { fieldName: "error message" }
  const [serverErrors, setServerErrors] = React.useState<Record<string, string> | null>(null);
  const [globalMessage, setGlobalMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // build defaultValues from schema (safely)
  const defaultValues: Record<string, any> = {};
  if (schema && Array.isArray(schema.fields)) {
    for (const f of schema.fields) {
      if (f.type === "multi-select") defaultValues[f.name] = [];
      else if (f.type === "switch") defaultValues[f.name] = false;
      else defaultValues[f.name] = "";
    }
  }

  // create TanStack Form instance
  const form = useForm({
    defaultValues,
    // form-level validators can be provided, but we'll set per-field validators dynamically below.
    onSubmit: async ({ value }) => {
      // clear old server errors & message
      setServerErrors(null);
      setGlobalMessage(null);

      try {
        const res = await mutation.mutateAsync(value);
        setSuccessPopup(`Submitted successfully — ID: ${res.id}`);

        form.reset(value ? {} : {}); // reset form (call with no args resets to default)
        if (onSubmitted) onSubmitted();
      } catch (err: any) {
  const apiError = err?.response?.data;

  // 1) Server field-level errors
  if (apiError?.errors && typeof apiError.errors === "object") {
    setServerErrors(apiError.errors);  
  }

  // 2) Human-readable general message
  const friendlyMessage =
    apiError?.message ||
    "Validation failed. Please correct the errors and try again.";

  setGlobalMessage({
    type: "error",
    text: friendlyMessage,
  });
}
    }
  });

  // If schema not loaded yet:
  if (schemaLoading) return <div>Loading form schema...</div>;
  if (schemaError || !schema) return <div>Failed to load schema</div>;

  return (
    <div className="max-w-3xl bg-white p-6 rounded shadow">
      {successPopup && (
  <SuccessPopup message={successPopup} onClose={() => setSuccessPopup(null)} />
)}

      <h2 className="text-xl font-semibold">{schema.title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{schema.description}</p>

      {/* show global messages */}
      {globalMessage && (
        <div className={`mb-3 p-2 rounded ${globalMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {globalMessage.text}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Map schema fields to form.Field components */}
        {schema.fields.map((f: any) => (
          <form.Field
            key={f.name}
            name={f.name}
            // simple field-level validators: return string for error or undefined/null when valid
            validators={{
              onChange: ({ value }) => {
                // light client-side checks following schema
                if (f.required) {
                  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
                    return `${f.label || f.name} is required`;
                  }
                }
                if ((f.type === "text" || f.type === "textarea") && f.validation) {
                  const { minLength, maxLength, regex } = f.validation;
                  if (minLength !== undefined && String(value).length < minLength) return `${f.label} must be at least ${minLength} characters`;
                  if (maxLength !== undefined && String(value).length > maxLength) return `${f.label} must be at most ${maxLength} characters`;
                  if (regex) {
                    try {
                      const re = new RegExp(regex);
                      if (!re.test(String(value))) return `${f.label} is invalid`;
                    } catch (e) {
                      // ignore regex building errors
                    }
                  }
                }
                if (f.type === "number" && f.validation) {
                  const n = Number(value);
                  if (isNaN(n)) return `${f.label} must be a number`;
                  if (f.validation.min !== undefined && n < f.validation.min) return `${f.label} must be >= ${f.validation.min}`;
                  if (f.validation.max !== undefined && n > f.validation.max) return `${f.label} must be <= ${f.validation.max}`;
                }
                if (f.type === "multi-select" && f.validation) {
                  const minSel = f.validation.minSelected;
                  const maxSel = f.validation.maxSelected;
                  if (minSel !== undefined && Array.isArray(value) && value.length < minSel) return `${f.label} requires at least ${minSel} selection(s)`;
                  if (maxSel !== undefined && Array.isArray(value) && value.length > maxSel) return `${f.label} allows at most ${maxSel} selection(s)`;
                }
                // ok
                return undefined;
              },
              onBlur: undefined,
            }}
          >
            {(field: any) => (
              <DynamicFieldRenderer f={f} field={field} serverErrors={serverErrors ?? {}} />
            )}
          </form.Field>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </button>

          {/* show mutation error details if any (not field-level) */}
          {mutation.isError && (
            <div className="mt-2 text-red-600">
              {(mutation.error as any)?.response?.data?.message ?? "Submission failed"}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
