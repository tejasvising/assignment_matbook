import React from "react";
import FormPage from "./pages/FormPage";
import SubmissionsPage from "./pages/SubmissionsPage";

export default function App() {
  const [route, setRoute] = React.useState<"form"|"subs">("form");
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">MatBook — Dynamic Form</h1>
        <nav className="space-x-3">
          <button onClick={() => setRoute("form")} className={`px-3 py-1 rounded ${route==="form"?"bg-blue-600 text-white":"bg-white"}`}>Form</button>
          <button onClick={() => setRoute("subs")} className={`px-3 py-1 rounded ${route==="subs"?"bg-blue-600 text-white":"bg-white"}`}>Submissions</button>
        </nav>
      </header>

      <main>
        {route === "form" ? <FormPage onSubmitted={() => setRoute("subs")} /> : <SubmissionsPage />}
      </main>
    </div>
  );
}
