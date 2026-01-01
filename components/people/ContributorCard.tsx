"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, GitPullRequest, GitMerge } from "lucide-react";

interface ContributorEntry {
  username: string;
  name: string | null;
  avatar_url: string;
  role: string;
  total_points: number;
  activity_breakdown: Record<string, { count: number; points: number }>;
  daily_activity: Array<{ date: string; count: number; points: number }>;
}

interface ContributorCardProps {
  contributor: ContributorEntry;
  onClick?: (contributor: ContributorEntry) => void;
  showStats?: boolean;
}

/* ---------------- ORDER + ICON NORMALIZATION ---------------- */

const ACTIVITY_ORDER = ["PR opened", "PR merged", "Issue opened"];

const sortActivities = (
  entries: [string, { count: number; points: number }][]
) =>
  entries.sort(
    ([a], [b]) =>
      ACTIVITY_ORDER.indexOf(a) - ACTIVITY_ORDER.indexOf(b)
  );

const getPRIcon = (activity: string) => {
  const type = activity.toLowerCase();
  if (type.includes("merged")) {
    return <GitMerge className="w-3 h-3 text-green-600" />;
  }
  if (type.includes("opened")) {
    return <GitPullRequest className="w-3 h-3 text-blue-600" />;
  }
  return null;
};

export function ContributorCard({
  contributor,
  onClick,
  showStats = true,
}: ContributorCardProps) {
  const topActivities = sortActivities(
    Object.entries(contributor.activity_breakdown)
  )
    .filter(([activity]) => activity.includes("PR"))
    .slice(0, 2);

  return (
    <Card
      onClick={() => onClick?.(contributor)}
      className="cursor-pointer hover:shadow-lg transition-all"
    >
      <CardContent className="p-4 text-center">
        <Avatar className="w-20 h-20 mx-auto mb-3">
          <AvatarImage src={contributor.avatar_url} />
          <AvatarFallback>
            {(contributor.name || contributor.username)
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-semibold truncate">
          {contributor.name || contributor.username}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          @{contributor.username}
        </p>

        <Badge variant="secondary">{contributor.role}</Badge>

        {showStats && (
          <>
            <div className="flex justify-center gap-2 text-xs mt-3">
              <Trophy className="w-3 h-3 text-yellow-600" />
              <span className="font-bold">{contributor.total_points}</span>
              <span className="text-muted-foreground">pts</span>
            </div>

            {topActivities.length > 0 && (
              <div className="flex justify-center gap-2 mt-3">
                {topActivities.map(([activity, data]) => (
                  <div
                    key={activity}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs"
                  >
                    {getPRIcon(activity)}
                    <span className="font-medium">{data.count}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
