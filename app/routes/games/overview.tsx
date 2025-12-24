import { useEffect, useState, useMemo } from "react";
import type { SVGProps } from "react";
import clsx from "clsx";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Badge } from "../../components/badge";
import { useAuth } from "~/context/auth-context";
import {
    subscribeToMatchResults,
    calculateTeamStats,
    type MatchResult,
    type TeamStats,
    goalTypeLabels,
    type GoalType,
} from "~/lib/firestore-games";
import {
    subscribeToEvents,
    type CalendarEvent,
    isGameEvent,
} from "~/lib/firestore-events";

type IconProps = SVGProps<SVGSVGElement>;
type TabType = "Overview" | "Game history" | "Player statistics";

export function meta() {
    return [
        { title: "Games Overview · Dashboard" },
        { name: "description", content: "Game statistics and overview" },
    ];
}

export default function GamesOverviewPage() {
    const { activeClub } = useAuth();
    const clubId = activeClub?.id ?? "";

    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
    const [gameEvents, setGameEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        return { start, end: new Date() };
    });

    // Subscribe to match results
    useEffect(() => {
        if (!clubId) return;

        setLoading(true);
        const unsubscribe = subscribeToMatchResults(
            clubId,
            (results) => {
                setMatchResults(results);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching match results:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [clubId]);

    // Subscribe to game events
    useEffect(() => {
        if (!clubId) return;

        const unsubscribe = subscribeToEvents(clubId, (events) => {
            const games = events.filter(e => isGameEvent(e.type));
            setGameEvents(games);
        });

        return () => unsubscribe();
    }, [clubId]);

    // Calculate team stats
    const teamStats = useMemo(() => {
        return calculateTeamStats(matchResults);
    }, [matchResults]);

    // Form string (last 5 results)
    const formString = useMemo(() => {
        const completedMatches = matchResults
            .filter(m => m.status === "completed")
            .slice(0, 5);
        
        return completedMatches.map(match => {
            const ourScore = match.isHome ? match.homeScore : match.awayScore;
            const theirScore = match.isHome ? match.awayScore : match.homeScore;
            if (ourScore > theirScore) return "W";
            if (ourScore === theirScore) return "D";
            return "L";
        });
    }, [matchResults]);

    return (
        <DashboardLayout>
            <div className="dark min-h-full -m-6 lg:-m-10 p-6 lg:p-10 bg-zinc-950 text-zinc-100">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-4">
                    <Button plain className="p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg">
                        <ChevronLeftIcon className="size-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <StatsIcon className="size-6 text-zinc-400" />
                        <Heading level={1} className="text-2xl font-semibold">
                            Game
                        </Heading>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <Button className="rounded-full bg-zinc-900 p-2 text-white hover:bg-zinc-800">
                            <PlusIcon className="size-5" />
                        </Button>
                        <Button className="relative rounded-full bg-zinc-800 p-2 text-zinc-400 border border-zinc-700 hover:bg-zinc-700">
                            <BellIcon className="size-5" />
                            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-500" />
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <GamesTabs activeTab="Overview" />

                {/* Date Filter */}
                <div className="flex items-center justify-between">
                    <Button outline className="gap-2">
                        <CalendarIcon className="size-4" />
                        Date
                        <span className="text-blue-600">{formatDateRange(dateRange.start)} – Today</span>
                    </Button>
                    <Button outline className="gap-2">
                        <FilterIcon className="size-4" />
                        Filter
                    </Button>
                </div>

                {/* General Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <SettingsIcon className="size-5" />
                        <span className="font-medium">General</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Current Form Card */}
                        <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                            <h3 className="text-sm font-medium text-zinc-500 mb-4">Current form</h3>
                            
                            {/* Form Display */}
                            <div className="flex gap-2 mb-6">
                                {formString.length > 0 ? (
                                    formString.map((result, i) => (
                                        <span
                                            key={i}
                                            className={clsx(
                                                "size-8 flex items-center justify-center rounded text-sm font-bold text-white",
                                                result === "W" && "bg-green-500",
                                                result === "D" && "bg-amber-500",
                                                result === "L" && "bg-red-500"
                                            )}
                                        >
                                            {result}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-zinc-400">No recent matches</span>
                                )}
                            </div>

                            {/* Games Played */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-zinc-100">Games played</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        {teamStats.wins} games won out of {teamStats.gamesPlayed} played
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500" />
                                            <span>Wins</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">{teamStats.wins}</span>
                                            <span className="text-zinc-400 w-12 text-right">
                                                {teamStats.gamesPlayed > 0 
                                                    ? ((teamStats.wins / teamStats.gamesPlayed) * 100).toFixed(1) 
                                                    : "0.0"}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-amber-500" />
                                            <span>Draws</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">{teamStats.draws}</span>
                                            <span className="text-zinc-400 w-12 text-right">
                                                {teamStats.gamesPlayed > 0 
                                                    ? ((teamStats.draws / teamStats.gamesPlayed) * 100).toFixed(1) 
                                                    : "0.0"}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-red-500" />
                                            <span>Losses</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">{teamStats.losses}</span>
                                            <span className="text-zinc-400 w-12 text-right">
                                                {teamStats.gamesPlayed > 0 
                                                    ? ((teamStats.losses / teamStats.gamesPlayed) * 100).toFixed(1) 
                                                    : "0.0"}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Empty state or chart */}
                                {teamStats.gamesPlayed === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                                        <NoDataIcon className="size-12 mb-2" />
                                        <span className="text-sm">No data available</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <span className="text-sm text-zinc-500">
                                        Win rate {teamStats.winRate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Game Strength Card */}
                        <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-zinc-100">Game strength</h3>
                                <p className="text-xs text-zinc-500">Goals scored and conceded over average match length</p>
                            </div>

                            {/* Chart placeholder */}
                            <div className="h-48 flex items-end justify-between gap-4">
                                <div className="flex flex-col items-center gap-1 text-xs text-zinc-500">
                                    <div className="h-32 w-16 bg-zinc-100 rounded-t relative overflow-hidden">
                                        {/* Chart bars would go here */}
                                    </div>
                                    <span>Game start</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-xs text-zinc-500">
                                    <div className="h-32 w-16 bg-zinc-100 rounded-t"></div>
                                    <span>Half time</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-xs text-zinc-500">
                                    <div className="h-32 w-16 bg-zinc-100 rounded-t"></div>
                                    <span>Game over!</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="size-3 rounded-full bg-green-500" />
                                    <span>Goals scored</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="size-3 rounded-full bg-red-500" />
                                    <span>Goals conceded</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals Scored Section */}
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                    <h3 className="text-sm font-medium text-zinc-100 mb-4">Goals scored</h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500" />
                                <span>Open play</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-medium">{teamStats.goalsByType.open_play}</span>
                                <span className="text-zinc-400 w-12 text-right">
                                    {getGoalPercentage(teamStats.goalsByType.open_play, teamStats.goalsScored)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-blue-500" />
                                <span>Set piece</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-medium">{teamStats.goalsByType.set_piece}</span>
                                <span className="text-zinc-400 w-12 text-right">
                                    {getGoalPercentage(teamStats.goalsByType.set_piece, teamStats.goalsScored)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Goals by type chart */}
                    <div className="h-48 flex items-end justify-between gap-2 border-l border-b border-zinc-200 pl-4 pb-4">
                        {(["open_play", "counter_attack", "kick_off", "corner", "free_kick", "throw_in", "penalty"] as GoalType[]).map((type) => (
                            <div key={type} className="flex flex-col items-center gap-1 flex-1">
                                <div 
                                    className="w-full max-w-8 bg-green-500/20 rounded-t"
                                    style={{ 
                                        height: teamStats.goalsScored > 0 
                                            ? `${(teamStats.goalsByType[type] / teamStats.goalsScored) * 100}%` 
                                            : "4px",
                                        minHeight: "4px"
                                    }}
                                />
                                <span className="text-[10px] text-zinc-500 text-center whitespace-nowrap">
                                    {goalTypeLabels[type].split(" ")[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                        label="Goals Scored" 
                        value={teamStats.goalsScored} 
                        trend={null}
                    />
                    <StatCard 
                        label="Goals Conceded" 
                        value={teamStats.goalsConceded} 
                        trend={null}
                    />
                    <StatCard 
                        label="Clean Sheets" 
                        value={teamStats.cleanSheets} 
                        trend={null}
                    />
                    <StatCard 
                        label="Goal Difference" 
                        value={teamStats.goalDifference} 
                        trend={teamStats.goalDifference > 0 ? "positive" : teamStats.goalDifference < 0 ? "negative" : null}
                    />
                </div>

                {/* Cards Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                        <h3 className="text-sm font-medium text-zinc-100 mb-4">Yellow Cards</h3>
                        <div className="flex items-center gap-4">
                            <div className="size-16 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{teamStats.yellowCards}</span>
                            </div>
                            <div className="text-sm text-zinc-500">
                                Total yellow cards received
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                        <h3 className="text-sm font-medium text-zinc-100 mb-4">Red Cards</h3>
                        <div className="flex items-center gap-4">
                            <div className="size-16 bg-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{teamStats.redCards}</span>
                            </div>
                            <div className="text-sm text-zinc-500">
                                Total red cards received
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
}

// Helper Components

function GamesTabs({ activeTab }: { activeTab: TabType }) {
    const tabs: TabType[] = ["Overview", "Game history", "Player statistics"];
    
    return (
        <div className="border-b border-zinc-200">
            <nav className="flex gap-6">
                {tabs.map((tab) => (
                    <a
                        key={tab}
                        href={`/games/${tab.toLowerCase().replace(" ", "-")}`}
                        className={clsx(
                            "pb-3 text-sm font-medium transition",
                            activeTab === tab
                                ? "border-b-2 border-zinc-900 text-zinc-100"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        {tab}
                    </a>
                ))}
            </nav>
        </div>
    );
}

function StatCard({ label, value, trend }: { label: string; value: number; trend: "positive" | "negative" | null }) {
    return (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className={clsx(
                "text-2xl font-semibold mt-1",
                trend === "positive" && "text-green-600",
                trend === "negative" && "text-red-600"
            )}>
                {trend === "positive" && "+"}
                {value}
            </p>
        </div>
    );
}

// Helper Functions

function formatDateRange(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function getGoalPercentage(goals: number, total: number): string {
    if (total === 0) return "0";
    return ((goals / total) * 100).toFixed(0);
}

// Icons

function ChevronLeftIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function StatsIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 9l-5 5-4-4-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PlusIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

function BellIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <path d="M18 10a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
        </svg>
    );
}

function CalendarIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
        </svg>
    );
}

function FilterIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SettingsIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    );
}

function NoDataIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h3" strokeLinecap="round" />
        </svg>
    );
}

