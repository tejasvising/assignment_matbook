// frontend/src/pages/SubmissionsPage.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSubmissions } from "../api";
import SubmissionViewModal from "../components/SubmissionViewModal";

export default function SubmissionsPage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["submissions", page, limit, sortOrder],
    queryFn: () => fetchSubmissions({ page, limit, sortBy: "createdAt", sortOrder }),
  });

  React.useEffect(() => {
    // refetch whenever page/limit/sort changes
    refetch();
  }, [page, limit, sortOrder, refetch]);

  if (isPending) {
    return <div className="p-4">Loading submissions...</div>;
  }

  if (isError || !data) {
    return <div className="p-4 text-red-600">Failed to load submissions. Try refreshing.</div>;
  }

  const items = data.items || [];

  return (
    <div className="bg-white p-4 rounded shadow max-w-5xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Submissions</h2>
        <div className="flex items-center space-x-2">
          <label>Per page</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* empty state */}
      {items.length === 0 ? (
        <div className="p-6 text-center text-gray-600">No submissions yet.</div>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Submission ID</th>
                <th
                  className="border p-2 cursor-pointer"
                  onClick={() => setSortOrder((s) => (s === "desc" ? "asc" : "desc"))}
                >
                  Created Date {sortOrder === "desc" ? "↓" : "↑"}
                </th>
                <th className="border p-2">View</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any) => (
                <tr key={it.id}>
                  <td className="border p-2">{it.id}</td>
                  <td className="border p-2">{new Date(it.createdAt).toLocaleString()}</td>
                  <td className="border p-2">
                    <button onClick={() => setSelectedId(it.id)} className="px-2 py-1 bg-blue-600 text-white rounded">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex items-center justify-between">
            <div>
              Total: {data.total} — Page {data.page} / {data.totalPages}
            </div>

            <div className="space-x-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded">
                Previous
              </button>

              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {selectedId && <SubmissionViewModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
