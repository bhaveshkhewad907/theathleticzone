import LiveSubscription from "./liveSubscription.model";
import LiveSessionConfig from "../liveConfig/liveSessionConfig.model";
import User from "../user/user.model";
import razorpay from "../../config/razorpay";
import ApiError from "../../utils/apiError";
import crypto from "crypto";
import { logger } from "../../utils/logger";

const getPlanDurationInMonths = (plan: string) => {
  switch (plan) {
    case "ONE_MONTH":
      return 1;
    case "THREE_MONTHS":
      return 3;
    case "SIX_MONTHS":
      return 6;
    case "YEARLY":
      return 12;
    default:
      throw new ApiError(400, "Invalid plan");
  }
};

export const createSubscriptionOrder = async (
  userId: string,
  type: "GROUP" | "ONE_ON_ONE",
  plan: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "YEARLY",
) => {
  const user = await User.findById(userId);
  if (!user || user.role !== "ATHLETE") {
    throw new ApiError(403, "Only athletes can purchase subscriptions");
  }

  const pricing = await LiveSessionConfig.findOne();
  if (!pricing) {
    throw new ApiError(500, "Pricing not configured");
  }

  const price = type === "GROUP" ? pricing.group[plan] : pricing.oneOnOne[plan];

  const subscription = await LiveSubscription.create({
    user: userId,
    type,
    plan,
    priceAtPurchase: price,
  });

  const order = await razorpay.orders.create({
    amount: price * 100,
    currency: "INR",
    receipt: `sub_${subscription._id}`,
    payment_capture: true,
  });

  subscription.razorpayOrderId = order.id;
  await subscription.save();

  return {
    subscription,
    order,
  };
};

export const verifySubscriptionPayment = async (
  userId: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
) => {
  const subscription = await LiveSubscription.findOne({
    razorpayOrderId: razorpay_order_id,
    user: userId,
  });

  if (!subscription) {
    throw new ApiError(400, "Invalid order");
  }

  if (subscription.status === "ACTIVE") {
    throw new ApiError(400, "Payment already processed");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }
  const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
  const expectedAmount = subscription.priceAtPurchase * 100;

  if (!razorpayOrder || razorpayOrder.amount !== expectedAmount) {
    console.error(
      `🚨 PAYLOAD SWAP DETECTED. User ${userId} attempted to activate subscription using a cheaper order.`,
    );
    throw new ApiError(400, "Payment amount mismatch. Access denied.");
  }

  await LiveSubscription.updateMany(
    { user: userId, status: "ACTIVE", _id: { $ne: subscription._id } },
    { $set: { status: "EXPIRED", endDate: new Date() } },
  );

  // Activate subscription
  const now = new Date();

  const months =
    subscription.plan === "ONE_MONTH"
      ? 1
      : subscription.plan === "THREE_MONTHS"
        ? 3
        : subscription.plan === "SIX_MONTHS"
          ? 6
          : 12;

  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + months);

  subscription.startDate = now;
  subscription.endDate = endDate;
  subscription.status = "ACTIVE";
  subscription.razorpayPaymentId = razorpay_payment_id;

  await subscription.save();

  logger.info("Subscription activated successfully", {
    event: "SUBSCRIPTION_ACTIVATED",
    service: "PaymentEngine",
    userId,
    plan: subscription.plan,
    type: subscription.type,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  return subscription;
};

export const processSubscriptionExpirations = async () => {
  const now = new Date();
  const result = await LiveSubscription.updateMany(
    {
      status: "ACTIVE",
      endDate: { $lt: now },
    },
    {
      $set: { status: "EXPIRED" },
    },
  );
  return result;
};
export const getMySubscriptions = async (userId: string) => {
  const now = new Date();

  // PERFORMANCE UPGRADE: The synchronous `updateMany` write operation has been
  // removed and offloaded to the 5-minute cron job. This prevents database
  // write-contention when hundreds of athletes load their dashboards.

  // Now simply fetch the clean data
  const subscriptions = await LiveSubscription.find({
    user: userId,
  }).sort({ createdAt: -1 });

  return subscriptions.map((sub) => {
    return {
      ...sub.toJSON(),
      isActive: sub.status === "ACTIVE" && sub.endDate && now <= sub.endDate,
      isExpired: sub.status === "EXPIRED",
    };
  });
};

export const createRenewalOrder = async (
  userId: string,
  subscriptionId: string,
  newPlan: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "YEARLY",
) => {
  const subscription = await LiveSubscription.findById(subscriptionId);

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (subscription.user.toString() !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  if (subscription.renewalStatus === "PENDING") {
    throw new ApiError(400, "Renewal already pending for this subscription");
  }

  const pricing = await LiveSessionConfig.findOne();
  if (!pricing) {
    throw new ApiError(500, "Pricing not configured");
  }

  const price =
    subscription.type === "GROUP"
      ? pricing.group[newPlan]
      : pricing.oneOnOne[newPlan];

  const order = await razorpay.orders.create({
    amount: price * 100,
    currency: "INR",
    receipt: `renew_${subscription._id}_${Date.now()}`,
    payment_capture: true,
  });

  // Bind order to subscription
  subscription.renewalOrderId = order.id;
  subscription.pendingRenewalPlan = newPlan;
  subscription.renewalStatus = "PENDING";

  await subscription.save();

  return {
    subscriptionId: subscription._id,
    newPlan,
    price,
    order,
  };
};

export const verifyRenewalPayment = async (
  userId: string,
  subscriptionId: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
) => {
  const subscription = await LiveSubscription.findById(subscriptionId);

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (subscription.user.toString() !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  if (
    subscription.renewalStatus !== "PENDING" ||
    !subscription.renewalOrderId ||
    !subscription.pendingRenewalPlan
  ) {
    throw new ApiError(400, "No pending renewal found");
  }

  // Order binding check
  if (subscription.renewalOrderId !== razorpay_order_id) {
    throw new ApiError(400, "Invalid renewal order");
  }

  // Signature validation
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const newPlan = subscription.pendingRenewalPlan;
  const pricing = await LiveSessionConfig.findOne();

  if (!pricing) throw new ApiError(500, "Pricing not configured");

  const expectedPrice =
    subscription.type === "GROUP"
      ? pricing.group[newPlan]
      : pricing.oneOnOne[newPlan];

  const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

  if (!razorpayOrder || razorpayOrder.amount !== expectedPrice * 100) {
    console.error(
      `🚨 PAYLOAD SWAP DETECTED. User ${userId} attempted a cheap renewal.`,
    );
    throw new ApiError(400, "Renewal amount mismatch. Access denied.");
  }

  const months =
    newPlan === "ONE_MONTH"
      ? 1
      : newPlan === "THREE_MONTHS"
        ? 3
        : newPlan === "SIX_MONTHS"
          ? 6
          : 12;

  const now = new Date();

  const baseDate =
    subscription.status === "ACTIVE" &&
    subscription.endDate &&
    now <= subscription.endDate
      ? subscription.endDate
      : now;

  const newEndDate = new Date(baseDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);

  // Extend subscription
  subscription.endDate = newEndDate;
  subscription.status = "ACTIVE";

  // Clear renewal fields (replay protection)
  subscription.renewalOrderId = undefined;
  subscription.pendingRenewalPlan = undefined;
  subscription.renewalStatus = undefined;

  await subscription.save();

  return subscription;
};

export const getMySubscriptionState = async (userId: string) => {
  const subscriptions = await LiveSubscription.find({
    user: userId,
  }).sort({ createdAt: -1 });

  const now = new Date();

  let activeSub: any = null;
  let expiredSub: any = null;

  for (const sub of subscriptions) {
    if (sub.status === "ACTIVE" && sub.endDate && now <= sub.endDate) {
      activeSub = sub;
      break;
    }
  }

  if (!activeSub) {
    expiredSub =
      subscriptions
        .filter((sub) => sub.status === "EXPIRED")
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] ||
      null;
  }

  const enrich = (sub: any) => {
    const totalMs =
      new Date(sub.endDate).getTime() - new Date(sub.startDate).getTime();

    const elapsedMs = now.getTime() - new Date(sub.startDate).getTime();

    const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(sub.endDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const progressPercentage = Math.min(
      100,
      Math.max(0, (elapsedMs / totalMs) * 100),
    );

    const canRenew =
      sub.status === "EXPIRED" ||
      (sub.status === "ACTIVE" && daysRemaining <= 7);

    return {
      _id: sub._id,
      type: sub.type,
      plan: sub.plan,
      startDate: sub.startDate,
      endDate: sub.endDate,
      priceAtPurchase: sub.priceAtPurchase,
      status: sub.status,
      daysRemaining,
      totalDays,
      progressPercentage,
      canRenew,
    };
  };

  return {
    active: activeSub ? enrich(activeSub) : null,
    expired: !activeSub && expiredSub ? enrich(expiredSub) : null,
    hasActive: !!activeSub,
  };
};
