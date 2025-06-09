import React, { useState } from "react";
import { api } from "../api/client";

const InviteUsersPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agent");
  const [msg, setMsg] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post("/invitations/invite", { email, role });
    setMsg("Invitation sent!");
    setEmail("");
  };

  return (
    <form className="p-8" onSubmit={handleInvite}>
      <h2 className="text-xl mb-4">Invite a User</h2>
      <input className="border p-2 mr-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <select className="border p-2 mr-2" value={role} onChange={e => setRole(e.target.value)}>
        <option value="Agent">Agent</option>
        <option value="Landlord">Landlord</option>
        <option value="Tenant">Tenant</option>
      </select>
      <button className="bg-blue-600 text-white p-2 rounded" type="submit">Invite</button>
      {msg && <div className="mt-2 text-green-600">{msg}</div>}
    </form>
  );
};
export default InviteUsersPage;