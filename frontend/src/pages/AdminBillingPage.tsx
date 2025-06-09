import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import AdminSidebar from "../components/admin/AdminSidebar";

type Subscription = {
  _id: string;
  orgId: string;
  plan: string;
  status: string;
  renewalDate: string;
};

const AdminBillingPage: React.FC = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    api.get("/billing/history").then(res => setSubs(res.data));
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Billing Overview</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Organization</th>
              <th className="border p-2">Plan</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Renewal</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s._id}>
                <td className="border p-2">{s.orgId}</td>
                <td className="border p-2">{s.plan}</td>
                <td className="border p-2">{s.status}</td>
                <td className="border p-2">{new Date(s.renewalDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminBillingPage;