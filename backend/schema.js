// schema.js
// This object will be returned by GET /api/form-schema
const formSchema = {
  title: "Employee Onboarding",
  description: "Collect basic employee information for onboarding.",
  fields: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100
      }
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      placeholder: "Enter age",
      required: true,
      validation: {
        min: 18,
        max: 70
      }
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      placeholder: "Select department",
      required: true,
      options: [
        { label: "Engineering", value: "engineering" },
        { label: "Design", value: "design" },
        { label: "Product", value: "product" },
        { label: "Sales", value: "sales" }
      ]
    },
    {
      name: "skills",
      label: "Skills",
      type: "multi-select",
      placeholder: "Select skills",
      required: true,
      options: [
        { label: "JavaScript", value: "javascript" },
        { label: "TypeScript", value: "typescript" },
        { label: "React", value: "react" },
        { label: "Spring Boot", value: "spring" },
        { label: "SQL", value: "sql" }
      ],
      validation: {
        minSelected: 1,
        maxSelected: 5
      }
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      placeholder: "Select start date",
      required: true,
      validation: {
        minDate: null // null means no minimum other than server can choose; we will parse and support
      }
    },
    {
      name: "bio",
      label: "Short Bio",
      type: "textarea",
      placeholder: "Tell us about yourself",
      required: false,
      validation: {
        maxLength: 500
      }
    },
    {
      name: "isRemote",
      label: "Remote Worker",
      type: "switch",
      placeholder: null,
      required: false
    },
    {
      name: "personalEmail",
      label: "Personal Email",
      type: "text",
      placeholder: "Enter personal email",
      required: true,
      validation: {
        regex: "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$",
        maxLength: 254
      }
    }
  ]
};

module.exports = { formSchema };
