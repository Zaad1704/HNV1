import React from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminDashboardPage: React.FC = () => (
  <div className="flex min-h-screen">
    <AdminSidebar />
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      <p>Welcome! Use the menu to manage organizations, users, content, or platform billing.</p>
    </main>
  </div>
);

export default AdminDashboardPage;