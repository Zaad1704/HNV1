import axios from "axios";
import Subscription from "../models/Subscription";

export type BillingPlan = { id: string; name: string; price: number; interval: "month" | "year" };
export const billingPlans: BillingPlan[] = [
  { id: "basic", name: "Basic", price: 29, interval: "month" },
  { id: "pro", name: "Pro", price: 59, interval: "month" },
  { id: "enterprise", name: "Enterprise", price: 99, interval: "month" },
];

// PRODUCTION: Real 2Checkout subscription creation (server-to-server)
export async function createSubscription2CO(orgId: string, planId: string, userEmail: string) {
  // Replace with actual 2Checkout API endpoint and payload
  const { TCO_SELLER_ID, TCO_PRIVATE_KEY } = process.env;
  // Implement real 2Checkout API call here
  // For now, placeholder for where you plug in your credentials and logic
  // Example:
  // const response = await axios.post('https://api.2checkout.com/rest/6.0/subscriptions/', {...}, {auth: ...});
  // return response.data;
  throw new Error("2Checkout integration required. Implement server-to-server API call here.");
}