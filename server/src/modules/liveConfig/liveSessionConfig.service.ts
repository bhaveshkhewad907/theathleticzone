import LiveSessionConfig from "./liveSessionConfig.model";

export const updatePricing = async (data: any) => {
  let config = await LiveSessionConfig.findOne();

  if (!config) {
    config = await LiveSessionConfig.create(data);
  } else {
    config.group = data.group;
    config.oneOnOne = data.oneOnOne;
    await config.save();
  }

  return config;
};

export const getPricing = async () => {
  return LiveSessionConfig.findOne();
};
