import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const BillingPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    api.get("/billing/plans").then(res => setPlans(res.data));
    api.get("/billing/history").then(res => setSub(res.data[0]));
  }, []);

  const handleSubscribe = async (planId: string) => {
    await api.post("/billing/subscribe", { planId });
    alert("Subscription started! (In production, you'll be redirected to 2Checkout.)");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Subscription</h1>
      {sub && <div className="mb-4">Current Plan: <b>{sub.plan}</b></div>}
      <h2 className="text-xl mb-2">Available Plans</h2>
      <ul>
        {plans.map(plan => (
          <li key={plan.id} className="mb-2">
            <b>{plan.name}</b> - ${plan.price}/mo
            <button className="ml-4 p-1 bg-blue-600 text-white rounded" onClick={() => handleSubscribe(plan.id)}>
              Subscribe
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default BillingPage;