import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar: React.FC = () => (
  <aside className="w-64 h-full bg-gray-800 text-white flex flex-col p-4">
    <h2 className="text-xl font-bold mb-6">Admin Menu</h2>
    <nav className="flex flex-col gap-4">
      <Link to="/admin/organizations" className="hover:underline">Organizations</Link>
      <Link to="/admin/users" className="hover:underline">Users</Link>
      <Link to="/admin/content" className="hover:underline">Content Management</Link>
      <Link to="/admin/billing" className="hover:underline">Billing</Link>
    </nav>
  </aside>
);

export default AdminSidebar;