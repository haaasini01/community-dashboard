// generateLeaderboard.ts

type Activity = {
  username: string;
  name?: string | null;
  avatar_url: string;
  role?: string;
  type: string;
  points: number;
  occured_at: string;
};

type ActivityBreakdown = Record<
  string,
  { count: number; points: number }
>;

type DailyActivity = {
  date: string;
  count: number;
  points: number;
};

type Contributor = {
  username: string;
  name: string | null;
  avatar_url: string;
  role: string;
  total_points: number;
  activity_breakdown: ActivityBreakdown;
  daily_activity: DailyActivity[];
};

/* -------------------------------------------------------
   NORMALIZE ACTIVITY TYPE
------------------------------------------------------- */
function normalizeActivityLabel(type: string): string | null {
  const t = type.toLowerCase();

  if (t === "pull_request_opened") return "PR opened";
  if (t === "pull_request_merged") return "PR merged";
  if (t.includes("issue")) return "Issue opened";
  if (t.includes("commit")) return "Commit";
  if (t.includes("star")) return "Star";

  return null;
}

/* -------------------------------------------------------
   SAFE BREAKDOWN MUTATION
------------------------------------------------------- */
function addToBreakdown(
  breakdown: ActivityBreakdown,
  label: string,
  points: number
) {
  breakdown[label] ??= { count: 0, points: 0 };
  breakdown[label].count += 1;
  breakdown[label].points += points;
}

/* -------------------------------------------------------
   MAIN GENERATOR
------------------------------------------------------- */
export function generateLeaderboard(
  activities: Activity[]
): Contributor[] {
  const contributors: Record<string, Contributor> = {};

  for (const activity of activities) {
    if (!activity.username) continue;

    // Guaranteed contributor initialization
    const contributor =
      contributors[activity.username] ??=
        {
          username: activity.username,
          name: activity.name ?? null,
          avatar_url: activity.avatar_url,
          role: activity.role ?? "Contributor",
          total_points: 0,
          activity_breakdown: {},
          daily_activity: [],
        };

    const label = normalizeActivityLabel(activity.type);
    if (!label) continue;

    addToBreakdown(
      contributor.activity_breakdown,
      label,
      activity.points
    );

    contributor.total_points += activity.points;

    // ---- DAILY ACTIVITY (STRICT SAFE) ----
    const date = new Date(activity.occured_at)
      .toISOString()
      .slice(0, 10);

    let day = contributor.daily_activity.find(
      d => d.date === date
    );

    if (!day) {
      day = {
        date,
        count: 0,
        points: 0,
      };
      contributor.daily_activity.push(day);
    }

    day.count += 1;
    day.points += activity.points;
  }

  return Object.values(contributors);
}
