import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import AdminSidebar from "../components/admin/AdminSidebar";

type Org = {
  _id: string;
  name: string;
  status: string;
  ownerId: string;
  createdAt: string;
};

const AdminOrganizationsPage: React.FC = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/organizations").then(res => {
      setOrgs(res.data);
      setLoading(false);
    });
  }, []);

  const handleSuspend = async (orgId: string, status: "active" | "suspended") => {
    await api.post("/admin/organizations/status", { orgId, status });
    setOrgs(orgs.map(org => org._id === orgId ? { ...org, status } : org));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Organizations</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Owner</th>
              <th className="border p-2">Created</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map(org => (
              <tr key={org._id}>
                <td className="border p-2">{org.name}</td>
                <td className="border p-2">{org.status}</td>
                <td className="border p-2">{org.ownerId}</td>
                <td className="border p-2">{new Date(org.createdAt).toLocaleDateString()}</td>
                <td className="border p-2">
                  {org.status === "active" ? (
                    <button
                      className="bg-yellow-600 text-white px-2 py-1 rounded"
                      onClick={() => handleSuspend(org._id, "suspended")}
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => handleSuspend(org._id, "active")}
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminOrganizationsPage;