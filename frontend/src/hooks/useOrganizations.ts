import { useState } from "react";
import apiClient from "../api/client";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([]);

  const fetchOrganizations = async () => {
    const res = await apiClient.get("/org");
    setOrganizations(res.data);
  };

  return { organizations, fetchOrganizations };
}
