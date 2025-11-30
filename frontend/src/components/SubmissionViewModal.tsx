import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSubmissionById } from "../api";

export default function SubmissionViewModal({
  id,
  onClose
}: {
  id: string;
  onClose: () => void;
}) {
  
  const {
    data,
    isPending,
    isError
  } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmissionById(id),
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded max-w-2xl w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Submission {id}</h3>
          <button onClick={onClose} className="px-2 py-1 border rounded">
            Close
          </button>
        </div>

        {isPending && <div>Loading...</div>}
        {isError && <div>Error loading submission</div>}

        {data && typeof data === "object" && (
          <div className="mt-4">
            <div>
              <strong>Created:</strong>{" "}
              {new Date((data as any).createdAt).toLocaleString()}
            </div>

            <pre className="bg-gray-100 p-3 rounded mt-3 overflow-auto text-sm">
              {JSON.stringify((data as any).payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
