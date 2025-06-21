// frontend/src/hooks/useBilling.ts
import { useState } from "react";
import apiClient from "../api/client";
import { useQuery } from '@tanstack/react-query'; // Import useQuery

export function useBilling() {
  const [plans, setPlans] = useState<any[]>([]); // This might become redundant if using useQuery
  const [billingHistory, setBillingHistory] = useState<any[]>([]); // This might become redundant if using useQuery

  // Refactor fetchPlans to use React Query, assuming /api/plans is the source
  const { data: fetchedPlans, isLoading: isLoadingPlans, isError: isErrorPlans } = useQuery({
    queryKey: ['billingPlans'],
    queryFn: async () => {
      const res = await apiClient.get("/plans"); // Fetch from the public /api/plans endpoint
      return res.data.data; // Assuming data structure { success: true, data: [...] }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Since backend/routes/billingRoutes.ts only has GET / and POST methods,
  // there's no direct /billing/history. You'd fetch subscription details from /billing.
  const { data: fetchedBillingInfo, isLoading: isLoadingBillingInfo, isError: isErrorBillingInfo } = useQuery({
    queryKey: ['userBillingInfo'],
    queryFn: async () => {
      const res = await apiClient.get("/billing"); // Fetch from /api/billing
      return res.data.data; // Assuming data structure { success: true, data: [...] }
    },
    staleTime: 1000 * 60 * 5,
  });

  // You can keep these for compatibility or remove them if you only rely on React Query data
  const fetchPlansLegacy = async () => {
    const res = await apiClient.get("/plans"); // Original call
    setPlans(res.data.data);
  };

  const fetchBillingHistoryLegacy = async () => {
    // This endpoint does not exist. You need to decide what 'history' means.
    // If it's the current subscription, use fetchedBillingInfo.
    // If it's a list of past payments, that's already covered by PaymentsPage /api/payments.
    // For now, keeping it as is will result in a 404 unless a new backend route is added.
    const res = await apiClient.get("/billing/history");
    setBillingHistory(res.data);
  };


  return {
    plans: fetchedPlans || [], // Use data from useQuery
    billingHistory: fetchedBillingInfo ? [fetchedBillingInfo] : [], // Wrap single object in array for 'history'
    isLoadingPlans,
    isErrorPlans,
    isLoadingBillingInfo,
    isErrorBillingInfo,
    // Provide a way to trigger refetch if needed, e.g., queryClient.invalidateQueries(['userBillingInfo'])
  };
}
