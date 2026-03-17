import { SessionStatus } from "./sessionStatus";
import ApiError from "../../utils/apiError";

export const assertValidTransition = (
  current: SessionStatus,
  next: SessionStatus,
) => {
  const allowedTransitions: Record<SessionStatus, SessionStatus[]> = {
    [SessionStatus.SCHEDULED]: [SessionStatus.LIVE, SessionStatus.MISSED],
    [SessionStatus.LIVE]: [SessionStatus.COMPLETED],
    [SessionStatus.COMPLETED]: [],
    [SessionStatus.MISSED]: [],
  };

  const isAllowed = allowedTransitions[current]?.includes(next);

  if (!isAllowed) {
    throw new ApiError(400, `Invalid session transition: ${current} → ${next}`);
  }
};
