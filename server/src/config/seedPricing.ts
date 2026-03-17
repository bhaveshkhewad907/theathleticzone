import LiveSessionConfig from "../modules/liveConfig/liveSessionConfig.model";

export const seedPricing = async () => {
  const existing = await LiveSessionConfig.findOne();

  if (existing) return;

  await LiveSessionConfig.create({
    group: {
      ONE_MONTH: 2000,
      THREE_MONTHS: 5000,
      SIX_MONTHS: 9000,
      YEARLY: 16000,
    },
    oneOnOne: {
      ONE_MONTH: 4000,
      THREE_MONTHS: 11000,
      SIX_MONTHS: 20000,
      YEARLY: 35000,
    },
  });

  console.log("✅ LiveSessionConfig seeded");
};
