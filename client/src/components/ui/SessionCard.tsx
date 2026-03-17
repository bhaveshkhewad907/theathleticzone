import { useEffect, useState } from "react";
import type { AthleteSession } from "../../types/athlete";

interface Props {
  session: AthleteSession;
  formatDateIST: (iso: string) => string;
}

export default function SessionCard({ session, formatDateIST }: Props) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sessionTime = new Date(session.scheduledDate).getTime();
  const diff = sessionTime - now;

  const isUpcoming = diff > 0;
  const isCompleted = session.status === "COMPLETED";

  // Countdown formatting
  const formatCountdown = () => {
    if (!isUpcoming) return null;

    const totalSeconds = Math.floor(diff / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const handleJoin = () => {
    if (!session.isJoinable || !session.meetingLink) return;
    window.open(session.meetingLink, "_blank");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0f0f1b] border border-white/5 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-600/10 transition">
      {/* LEFT */}
      <div>
        <p className="text-white/80 text-sm">
          {formatDateIST(session.scheduledDate)}
        </p>

        {isUpcoming && (
          <p className="text-xs text-purple-400 mt-1">
            Starts in {formatCountdown()}
          </p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* LIVE Badge */}
        {session.isLive && (
          <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            LIVE
          </span>
        )}

        {/* Join Button */}
        {session.isJoinable && session.meetingLink && !isCompleted && (
          <button
            onClick={handleJoin}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm transition shadow-md hover:shadow-purple-600/30"
          >
            Join
          </button>
        )}

        {/* Join Closed */}
        {!session.isJoinable && !session.isLive && !isCompleted && (
          <span className="text-xs text-white/40">Join window closed</span>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
