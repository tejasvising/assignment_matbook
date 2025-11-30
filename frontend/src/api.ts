import axios from "axios";
// ??
const API_URL =  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" }
});
export async function fetchFormSchema() {
  const r = await api.get("/form-schema");
  return r.data;
}

export async function postSubmission(payload: any) {
  const r = await api.post("/submissions", payload);
  return r.data;
}

export async function fetchSubmissions({ page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = {}) {
  const r = await api.get("/submissions", {
    params: { page, limit, sortBy, sortOrder }
  });
  return r.data;
}

export async function fetchSubmissionById(id: string) {
  const r = await api.get(`/submissions/${id}`);
  return r.data;
}

export default api;
