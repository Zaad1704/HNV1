import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import AdminSidebar from "../components/admin/AdminSidebar";

type ContentMap = { [key: string]: string };

const AdminContentPage: React.FC = () => {
  const [content, setContent] = useState<ContentMap>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/content").then(res => setContent(res.data));
  }, []);

  const handleChange = (key: string, value: string) => {
    setContent({ ...content, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    await api.put("/admin/content", content);
    setSaving(false);
    alert("Content updated.");
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Content Management</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
          className="max-w-lg"
        >
          <label className="block mb-2 font-semibold">Home Page Title</label>
          <input
            className="border p-2 w-full mb-4"
            value={content.homeTitle || ""}
            onChange={e => handleChange("homeTitle", e.target.value)}
          />
          <label className="block mb-2 font-semibold">Home Page Description</label>
          <textarea
            className="border p-2 w-full mb-4"
            rows={4}
            value={content.homeDescription || ""}
            onChange={e => handleChange("homeDescription", e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            type="submit"
            disabled={saving}
          >
            Save
          </button>
        </form>
      </main>
    </div>
  );
};

export default AdminContentPage;