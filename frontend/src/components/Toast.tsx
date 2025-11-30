import React, { useEffect } from "react";

export default function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[9999]">
      <div
        className={`px-5 py-3 rounded shadow-lg text-white animate-slide-in 
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {message}
      </div>
    </div>
  );
}
