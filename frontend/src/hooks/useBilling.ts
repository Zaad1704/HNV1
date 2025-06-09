import { useState } from "react";
import { api } from "../api/client";

export function useBilling() {
  const [plans, setPlans] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  const fetchPlans = async () => {
    const res = await api.get("/billing/plans");
    setPlans(res.data);
  };

  const fetchBillingHistory = async () => {
    const res = await api.get("/billing/history");
    setBillingHistory(res.data);
  };

  return { plans, billingHistory, fetchPlans, fetchBillingHistory };
}