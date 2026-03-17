import Schedule from "../schedule/schedule.model";

export const getCoachSessionHistory = async (
  coachId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    Schedule.find({
      coach: coachId,
      status: "COMPLETED",
    })
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("athletes", "name")
      .populate("sport", "name"),

    Schedule.countDocuments({
      coach: coachId,
      status: "COMPLETED",
    }),
  ]);

  return {
    sessions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
