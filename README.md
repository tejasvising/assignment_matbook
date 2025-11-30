# Dynamic Form Builder & Submission Portal  
This project is a full-stack assignment consisting of:

- **Frontend**: React (Vite) + TypeScript  
- **Form System**: TanStack Form  
- **Data Fetching & Mutation**: TanStack React Query  
- **Backend**: Node.js + Express  
- **Database**: SQLite (via better-sqlite3)  
- **Validation**: Backend schema-based validation with dynamic rules  
- **Deployment Ready**: Works on Vercel (frontend) + Render/Railway (backend)

The system dynamically renders forms from a backend-provided schema, validates input (both client & server-side), and stores user submissions.

---

# 🚀 Features

### ✅ Dynamic Form Rendering  
- Backend provides a JSON schema.  
- Frontend renders:
  - text  
  - number  
  - textarea  
  - date  
  - switch  
  - select  
  - multi-select with **max selection limit**

---

### ✅ Full Validation System  
**Frontend validation**  
- TanStack Form per-field validators  
- Inline error messages  
- Start date cannot be in the future  
- Multi-select limited to 5  
- Required checks, regex, min/max numbers, min/max selections

**Backend validation (authoritative)**  
- Schema-driven  
- Automatic validation for every field  
- Returns field-level errors + global e
