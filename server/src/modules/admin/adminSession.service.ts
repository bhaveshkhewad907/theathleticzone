import Schedule from "../schedule/schedule.model";

export const getAdminSessions = async (
  page: number,
  limit: number,
  // 🚀 FIX 1: Allow the Admin to filter by ALL session states
  status?: "SCHEDULED" | "COMPLETED" | "LIVE" | "MISSED",
) => {
  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    Schedule.find(filter)
      .populate("sport", "name")
      .populate("coach", "name")
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Schedule.countDocuments(filter),
  ]);

  const formatted = sessions.map((session: any) => ({
    _id: session._id,
    sport: session.sport,
    coach: session.coach,
    athletesCount: session.athletes?.length || 0,
    scheduledDate: session.scheduledDate,
    scheduledTime: session.scheduledTime,
    status: session.status,
    meetingLink: session.meetingLink, // 🚀 FIX 2: Send the link to the UI!
    createdAt: session.createdAt,
  }));

  return {
    sessions: formatted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
