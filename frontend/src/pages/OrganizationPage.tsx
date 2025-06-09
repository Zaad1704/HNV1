import React, { useEffect, useState } from "react";
import { api } from "../api/client";

type Org = {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
};

const OrganizationPage: React.FC = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/org").then(res => setOrgs(res.data));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/org", { name });
    setMsg("Organization created!");
    setName("");
    const res = await api.get("/org");
    setOrgs(res.data);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">My Organizations</h2>
      <ul className="mb-4">
        {orgs.map(org => (
          <li key={org._id} className="mb-2 border p-2 rounded">
            <b>{org.name}</b> — {org.status}
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          className="border p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Organization Name"
          required
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">
          Create
        </button>
      </form>
      {msg && <div className="text-green-600 mt-2">{msg}</div>}
    </div>
  );
};
export default OrganizationPage;