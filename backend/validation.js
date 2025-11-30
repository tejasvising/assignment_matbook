// validation.js
const { formSchema } = require("./schema");
const dayjs = require("dayjs");

function validateSubmission(payload) {
  const errors = {};
  const fields = formSchema.fields;

  for (const f of fields) {
    const name = f.name;
    const value = payload[name];

    // Required
    if (f.required && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) {
      errors[name] = `${f.label || name} is required`;
      continue;
    }

    if (value === undefined || value === null || value === "") {
      // not required and not provided, skip further validation
      continue;
    }

    switch (f.type) {
      case "text":
      case "textarea":
        if (f.validation) {
          const { minLength, maxLength, regex } = f.validation;
          if (minLength !== undefined && String(value).length < minLength) {
            errors[name] = `${f.label} must be at least ${minLength} characters`;
          } else if (maxLength !== undefined && String(value).length > maxLength) {
            errors[name] = `${f.label} must be at most ${maxLength} characters`;
          }
          if (regex) {
            const re = new RegExp(regex);
            if (!re.test(String(value))) {
              errors[name] = `${f.label} is invalid`;
            }
          }
        }
        break;

      case "number":
        const num = Number(value);
        if (Number.isNaN(num)) {
          errors[name] = `${f.label} must be a number`;
        } else if (f.validation) {
          const { min, max } = f.validation;
          if (min !== undefined && num < min) {
            errors[name] = `${f.label} must be >= ${min}`;
          } else if (max !== undefined && num > max) {
            errors[name] = `${f.label} must be <= ${max}`;
          }
        }
        break;

      case "select":
        if (!f.options || !f.options.find((o) => o.value === value)) {
          errors[name] = `${f.label} has an invalid selection`;
        }
        break;

      case "multi-select":
        if (!Array.isArray(value)) {
          errors[name] = `${f.label} must be an array`;
        } else if (f.validation) {
          const { minSelected, maxSelected } = f.validation;
          if (minSelected !== undefined && value.length < minSelected) {
            errors[name] = `${f.label} requires at least ${minSelected} selection(s)`;
          } else if (maxSelected !== undefined && value.length > maxSelected) {
            errors[name] = `${f.label} allows at most ${maxSelected} selection(s)`;
          }
          // also verify selected values are in options
          const allowed = (f.options || []).map((o) => o.value);
          for (const v of value) {
            if (!allowed.includes(v)) {
              errors[name] = `${f.label} contains invalid selection`;
              break;
            }
          }
        }
        break;

     case "date": {
  const d = dayjs(String(value));

  // 1) basic validity check
  if (!d.isValid()) {
    errors[name] = `${f.label} must be a valid date`;
    break;
  }

  // 2) schema-based minDate rule (your existing logic)
  if (f.validation && f.validation.minDate) {
    const minD = dayjs(f.validation.minDate);
    if (minD.isValid() && d.isBefore(minD, "day")) {
      errors[name] = `${f.label} must be on or after ${minD.format("YYYY-MM-DD")}`;
      break;
    }
  }

  // 3) ONLY for startDate: cannot be a future date
  if (f.name === "startDate") {
    const today = dayjs().startOf("day");
    if (d.isAfter(today, "day")) {
      errors[name] = `${f.label} cannot be in the future`;
      break;
    }
  }

  break;
}

        

      case "switch":
        if (typeof value !== "boolean") {
          // allow booleans or strings "true"/"false"
          if (value === "true" || value === "false") {
            // ok
          } else {
            errors[name] = `${f.label} must be boolean`;
          }
        }
        break;

      default:
        break;
    }
  }

  return Object.keys(errors).length ? { valid: false, errors } : { valid: true };
}

module.exports = { validateSubmission };
