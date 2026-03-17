import api from "./api";
import type { SubscriptionState } from "../types/athlete";

export const getMySubscriptions = async (): Promise<SubscriptionState> => {
  const res = await api.get<{ success: boolean; data: SubscriptionState }>(
    "/live-subscription/my",
  );

  return res.data.data;
};

export const createSubscriptionOrder = async (
  type: "GROUP" | "ONE_ON_ONE",
  plan: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "YEARLY",
) => {
  const res = await api.post("/live-subscription/create-order", {
    type,
    plan,
  });

  return res.data.data;
};

export const createRenewalOrder = async (
  subscriptionId: string,
  newPlan: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "YEARLY",
) => {
  const res = await api.post(`/live-subscription/renew/${subscriptionId}`, {
    newPlan,
  });

  return res.data;
};

export const verifyRenewalPayment = async (payload: {
  subscriptionId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const res = await api.post("/live-subscription/renew/verify", payload);
  return res.data;
};
