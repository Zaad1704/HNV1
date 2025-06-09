import React, { useEffect } from "react";
import { useOrgStore } from "../store/orgStore";

const OrgSwitcher: React.FC = () => {
  const { orgs, currentOrg, persistCurrentOrg, loadPersistedOrg } = useOrgStore();

  useEffect(() => {
    loadPersistedOrg();
  }, [orgs.length]);

  if (orgs.length < 2) return null;

  return (
    <div className="mb-4">
      <label className="mr-2 font-semibold">Organization:</label>
      <select
        className="border p-1"
        value={currentOrg?._id || ""}
        onChange={e => {
          const selected = orgs.find((o) => o._id === e.target.value);
          if (selected) persistCurrentOrg(selected);
        }}
      >
        {orgs.map((org) => (
          <option key={org._id} value={org._id}>{org.name}</option>
        ))}
      </select>
    </div>
  );
};

export default OrgSwitcher;