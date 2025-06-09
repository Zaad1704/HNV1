import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useParams, useNavigate } from "react-router-dom";

const AcceptInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [invite, setInvite] = useState<any>(null);
  const [form, setForm] = useState({ name: "", password: "" });
  const [registered, setRegistered] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/invitations/info/${token}`).then(res => setInvite(res.data)).catch(() => setInvite(null));
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;
    // Register and accept invitation in one step
    await api.post("/auth/register", {
      email: invite.email,
      name: form.name,
      password: form.password,
      invitationToken: token
    });
    setRegistered(true);
    setMsg("Registration complete! You can now log in.");
    setTimeout(() => navigate("/login"), 2000);
  };

  if (!invite) return <div className="p-8 text-red-600">Invalid or expired invitation.</div>;
  if (registered) return <div className="p-8 text-green-600">{msg}</div>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Accept Invitation</h2>
      <div className="mb-4">
        <b>Email:</b> {invite.email}<br />
        <b>Role:</b> {invite.role}<br />
        <b>Organization:</b> {invite.orgName}
      </div>
      <form onSubmit={handleAccept}>
        <input
          className="border p-2 mb-2 w-full"
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border p-2 mb-2 w-full"
          type="password"
          placeholder="Set a password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Accept & Register
        </button>
      </form>
    </div>
  );
};
export default AcceptInvitePage;