import React, { useEffect, useState } from "react";
import apiClient from "../api/client"; // Corrected: Import the default export
import AdminSidebar from "../components/admin/AdminSidebar";

type Content = {
  id: string;
  page: string;
  title: string;
  content: string;
};

const AdminContentPage: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await apiClient.get("/admin/content");
        setContent(response.data);
      } catch (err) {
        setError("Failed to fetch content.");
      }
    };
    fetchContent();
  }, []);

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-4">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Content Management</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Page</th>
                <th className="text-left">Title</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={item.id}>
                  <td>{item.page}</td>
                  <td>{item.title}</td>
                  <td>
                    <button className="text-blue-500">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPage;
