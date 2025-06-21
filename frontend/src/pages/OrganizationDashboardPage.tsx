import React, { useEffect, useState } from "react";
import { useOrgStore } from "../store/orgStore";
import apiClient from "../api/client";
import OrgSwitcher from "../components/OrgSwitcher";

const OrganizationDashboardPage: React.FC = () => {
  const { orgs, setOrgs, currentOrg, persistCurrentOrg } = useOrgStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiClient.get("/org").then(res => {
      setOrgs(res.data);
      // First load: set default or persisted org
      if (res.data.length && !currentOrg) {
        const persisted = localStorage.getItem("currentOrgId");
        const found = res.data.find((o: any) => o._id === persisted);
        persistCurrentOrg(found || res.data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (currentOrg) {
      apiClient.get(`/org/${currentOrg._id}/stats`).then(res => setStats(res.data));
    }
  }, [currentOrg]);

  if (!currentOrg) return <div className="p-8">No organization selected.</div>;

  return (
    <div className="p-8">
      <OrgSwitcher />
      <h1 className="text-2xl mb-4">{currentOrg.name} Dashboard</h1>
      {stats ? (
        <div>
          <div className="mb-2"><b>Members:</b> {stats.members}</div>
          <div className="mb-2"><b>Active Tenants:</b> {stats.tenants}</div>
          <div className="mb-2"><b>Properties:</b> {stats.properties}</div>
        </div>
      ) : (
        <div>Loading organization stats...</div>
      )}
    </div>
  );
};

export default OrganizationDashboardPage;
