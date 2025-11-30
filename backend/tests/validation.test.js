// backend/tests/validation.test.js
const { validateSubmission } = require("../validation");

describe("validateSubmission", () => {
  test("valid payload passes validation", () => {
    const payload = {
      fullName: "Alice Johnson",
      age: 30,
      department: "engineering",
      skills: ["javascript", "react"],
      startDate: "2025-11-01",
      bio: "Hello",
      isRemote: false,
      personalEmail: "alice@example.com",
    };

    const result = validateSubmission(payload);
    expect(result.valid).toBe(true);
  });

  test("missing required fields returns errors", () => {
    const payload = {
      age: 17, // too young
      department: "engineering",
      skills: [],
    };

    const result = validateSubmission(payload);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("fullName");
    // age fails min check
    expect(result.errors).toHaveProperty("age");
    // personalEmail required
    expect(result.errors).toHaveProperty("personalEmail");
  });

  test("invalid email triggers error", () => {
    const payload = {
      fullName: "Bob",
      age: 25,
      department: "engineering",
      skills: ["react"],
      startDate: "2025-10-01",
      personalEmail: "not-an-email",
    };

    const result = validateSubmission(payload);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("personalEmail");
  });

  test("multi-select min/max selection enforced", () => {
    const payload = {
      fullName: "Carol",
      age: 28,
      department: "engineering",
      skills: [], // minSelected will cause error (schema minSelected=1)
      startDate: "2025-10-01",
      personalEmail: "carol@example.com",
    };
    const result = validateSubmission(payload);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("skills");
  });

});
