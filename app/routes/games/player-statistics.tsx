import { useEffect, useState, useMemo } from "react";
import type { SVGProps } from "react";
import clsx from "clsx";
import { Link } from "react-router";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import { useAuth } from "~/context/auth-context";
import {
    subscribeToMatchResults,
    calculatePlayerStats,
    type MatchResult,
    type PlayerSeasonStats,
} from "~/lib/firestore-games";

type IconProps = SVGProps<SVGSVGElement>;
type StatsTab = "Totals" | "Minutes played";
type SortField = "player" | "gamesPlayed" | "starts" | "minutesPlayed" | "goals" | "assists" | "totalPoints" | "yellowCards" | "redCards";
type SortDirection = "asc" | "desc";

export function meta() {
    return [
        { title: "Player Statistics · Dashboard" },
        { name: "description", content: "View player statistics from games" },
    ];
}

export default function PlayerStatisticsPage() {
    const { activeClub } = useAuth();
    const clubId = activeClub?.id ?? "";

    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStatsTab, setActiveStatsTab] = useState<StatsTab>("Totals");
    const [sortField, setSortField] = useState<SortField>("player");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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

    // Calculate player stats
    const playerStats = useMemo(() => {
        return calculatePlayerStats(matchResults);
    }, [matchResults]);

    // Sort player stats
    const sortedStats = useMemo(() => {
        return [...playerStats].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "player":
                    comparison = a.playerName.localeCompare(b.playerName);
                    break;
                case "gamesPlayed":
                    comparison = a.gamesPlayed - b.gamesPlayed;
                    break;
                case "starts":
                    comparison = a.starts - b.starts;
                    break;
                case "minutesPlayed":
                    comparison = a.minutesPlayed - b.minutesPlayed;
                    break;
                case "goals":
                    comparison = a.goals - b.goals;
                    break;
                case "assists":
                    comparison = a.assists - b.assists;
                    break;
                case "totalPoints":
                    comparison = a.totalPoints - b.totalPoints;
                    break;
                case "yellowCards":
                    comparison = a.yellowCards - b.yellowCards;
                    break;
                case "redCards":
                    comparison = a.redCards - b.redCards;
                    break;
                default:
                    comparison = 0;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [playerStats, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

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

                {/* Main Tabs */}
                <GamesTabs activeTab="Player statistics" />

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

                {/* Stats Sub-tabs */}
                <div className="border-b border-zinc-200">
                    <nav className="flex gap-6">
                        {(["Totals", "Minutes played"] as StatsTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveStatsTab(tab)}
                                className={clsx(
                                    "pb-3 text-sm font-medium transition",
                                    activeStatsTab === tab
                                        ? "border-b-2 border-zinc-900 text-zinc-100"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : activeStatsTab === "Totals" ? (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("player")}
                                            className="flex items-center gap-1 hover:text-zinc-100 text-amber-600"
                                        >
                                            Player
                                            <SortIcon active={sortField === "player"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("gamesPlayed")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Games played
                                            <SortIcon active={sortField === "gamesPlayed"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("starts")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Starts
                                            <SortIcon active={sortField === "starts"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("minutesPlayed")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Minutes played
                                            <SortIcon active={sortField === "minutesPlayed"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("goals")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Goals
                                            <SortIcon active={sortField === "goals"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("assists")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Assists
                                            <SortIcon active={sortField === "assists"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("totalPoints")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Total points
                                            <SortIcon active={sortField === "totalPoints"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("yellowCards")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Yellow cards
                                            <SortIcon active={sortField === "yellowCards"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("redCards")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Red cards
                                            <SortIcon active={sortField === "redCards"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedStats.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9}>
                                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                                <NoDataIcon className="size-12 mb-2" />
                                                <span className="text-sm">No player statistics available</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedStats.map((player) => (
                                        <TableRow key={player.playerId}>
                                            <TableCell className="font-medium text-amber-600">{player.playerName}</TableCell>
                                            <TableCell>{formatFraction(player.gamesPlayed, matchResults.filter(m => m.status === "completed").length)}</TableCell>
                                            <TableCell>{formatFraction(player.starts, player.gamesPlayed)}</TableCell>
                                            <TableCell>{player.minutesPlayed}</TableCell>
                                            <TableCell>{player.goals || <span className="text-zinc-400">-</span>}</TableCell>
                                            <TableCell>{player.assists || <span className="text-zinc-400">-</span>}</TableCell>
                                            <TableCell>{player.totalPoints || <span className="text-zinc-400">-</span>}</TableCell>
                                            <TableCell>{player.yellowCards || <span className="text-zinc-400">-</span>}</TableCell>
                                            <TableCell>{player.redCards || <span className="text-zinc-400">-</span>}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    // Minutes played view
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Player</TableHeader>
                                    <TableHeader>Total Minutes</TableHeader>
                                    <TableHeader>Avg Minutes/Game</TableHeader>
                                    <TableHeader>Games Played</TableHeader>
                                    <TableHeader>Full Matches</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedStats.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                                <NoDataIcon className="size-12 mb-2" />
                                                <span className="text-sm">No player statistics available</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    [...sortedStats]
                                        .sort((a, b) => b.minutesPlayed - a.minutesPlayed)
                                        .map((player) => (
                                            <TableRow key={player.playerId}>
                                                <TableCell className="font-medium">{player.playerName}</TableCell>
                                                <TableCell>{player.minutesPlayed}</TableCell>
                                                <TableCell>
                                                    {player.gamesPlayed > 0 
                                                        ? Math.round(player.minutesPlayed / player.gamesPlayed) 
                                                        : 0}
                                                </TableCell>
                                                <TableCell>{player.gamesPlayed}</TableCell>
                                                <TableCell>{player.starts}</TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination info */}
                <div className="text-sm text-zinc-500">
                    Showing <span className="font-medium text-zinc-100">1</span> to{" "}
                    <span className="font-medium text-zinc-100">{sortedStats.length}</span>
                    <br />
                    <span className="text-zinc-400">of {sortedStats.length} results</span>
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
}

// Components

function GamesTabs({ activeTab }: { activeTab: string }) {
    const tabs = ["Overview", "Game history", "Player statistics"];
    
    return (
        <div className="border-b border-zinc-200">
            <nav className="flex gap-6">
                {tabs.map((tab) => (
                    <Link
                        key={tab}
                        to={`/games/${tab.toLowerCase().replace(" ", "-")}`}
                        className={clsx(
                            "pb-3 text-sm font-medium transition",
                            activeTab === tab
                                ? "border-b-2 border-zinc-900 text-zinc-100"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        {tab}
                    </Link>
                ))}
            </nav>
        </div>
    );
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className={clsx("size-4", active ? "text-zinc-100" : "text-zinc-300")}
        >
            <path d="M8 10l4-4 4 4M8 14l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Helper Functions

function formatDateRange(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function formatFraction(numerator: number, denominator: number): string {
    return `${numerator}/${denominator}`;
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

function NoDataIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h3" strokeLinecap="round" />
        </svg>
    );
}

