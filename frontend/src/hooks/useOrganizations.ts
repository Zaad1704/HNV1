import { useState } from "react";
import { api } from "../api/client";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([]);

  const fetchOrganizations = async () => {
    const res = await api.get("/org");
    setOrganizations(res.data);
  };

  return { organizations, fetchOrganizations };
}