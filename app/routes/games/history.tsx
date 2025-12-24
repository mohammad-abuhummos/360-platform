import { useEffect, useState, useMemo } from "react";
import type { SVGProps } from "react";
import clsx from "clsx";
import { Link } from "react-router";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Badge } from "../../components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import { useAuth } from "~/context/auth-context";
import {
    subscribeToMatchResults,
    getMatchOutcome,
    formatMatchScore,
    type MatchResult,
} from "~/lib/firestore-games";
import {
    subscribeToEvents,
    type CalendarEvent,
    isGameEvent,
} from "~/lib/firestore-events";

type IconProps = SVGProps<SVGSVGElement>;
type SortField = "team" | "date" | "result" | "competition" | "yellowCards" | "redCards";
type SortDirection = "asc" | "desc";

export function meta() {
    return [
        { title: "Game History · Dashboard" },
        { name: "description", content: "View your team's game history" },
    ];
}

export default function GameHistoryPage() {
    const { activeClub } = useAuth();
    const clubId = activeClub?.id ?? "";

    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
    const [gameEvents, setGameEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
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

    // Subscribe to game events (to show games even without results)
    useEffect(() => {
        if (!clubId) return;

        const unsubscribe = subscribeToEvents(clubId, (events) => {
            const games = events.filter(e => isGameEvent(e.type));
            setGameEvents(games);
        });

        return () => unsubscribe();
    }, [clubId]);

    // Combine match results with game events
    const combinedGames = useMemo(() => {
        const resultsByEventId = new Map(matchResults.map(r => [r.eventId, r]));
        
        return gameEvents
            .map(event => {
                const result = resultsByEventId.get(event.id);
                return {
                    eventId: event.id,
                    opponentName: event.gameDetails?.awayTeam?.name || event.gameDetails?.homeTeam?.name || "TBD",
                    date: event.startTime.toDate(),
                    competition: event.gameDetails?.competition || "",
                    result: result,
                    homeScore: result?.homeScore ?? null,
                    awayScore: result?.awayScore ?? null,
                    yellowCards: result?.cards.filter(c => c.cardType === "yellow").length ?? 0,
                    redCards: result?.cards.filter(c => c.cardType === "red").length ?? 0,
                    status: result?.status || "scheduled",
                };
            })
            .filter(game => {
                const gameDate = game.date;
                return gameDate >= dateRange.start && gameDate <= dateRange.end;
            });
    }, [gameEvents, matchResults, dateRange]);

    // Sort games
    const sortedGames = useMemo(() => {
        return [...combinedGames].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "team":
                    comparison = a.opponentName.localeCompare(b.opponentName);
                    break;
                case "date":
                    comparison = a.date.getTime() - b.date.getTime();
                    break;
                case "competition":
                    comparison = a.competition.localeCompare(b.competition);
                    break;
                case "yellowCards":
                    comparison = a.yellowCards - b.yellowCards;
                    break;
                case "redCards":
                    comparison = a.redCards - b.redCards;
                    break;
                default:
                    comparison = a.date.getTime() - b.date.getTime();
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [combinedGames, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
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
                        <StatsIcon className="size-6 text-zinc-600" />
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
                <GamesTabs activeTab="Game history" />

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

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("team")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Team
                                            <SortIcon active={sortField === "team"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("date")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Date
                                            <SortIcon active={sortField === "date"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("result")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Result
                                            <SortIcon active={sortField === "result"} direction={sortDirection} />
                                        </button>
                                    </TableHeader>
                                    <TableHeader>
                                        <button 
                                            onClick={() => handleSort("competition")}
                                            className="flex items-center gap-1 hover:text-zinc-100"
                                        >
                                            Competition
                                            <SortIcon active={sortField === "competition"} direction={sortDirection} />
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
                                {sortedGames.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                                <NoDataIcon className="size-12 mb-2" />
                                                <span className="text-sm">No games found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedGames.map((game) => (
                                        <TableRow key={game.eventId} href={`/events/${game.eventId}`}>
                                            <TableCell className="font-medium">{game.opponentName}</TableCell>
                                            <TableCell>{formatDate(game.date)}</TableCell>
                                            <TableCell>
                                                {game.homeScore !== null && game.awayScore !== null ? (
                                                    <ResultBadge 
                                                        homeScore={game.homeScore} 
                                                        awayScore={game.awayScore}
                                                        isHome={game.result?.isHome ?? true}
                                                    />
                                                ) : (
                                                    <span className="text-zinc-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {game.competition || <span className="text-zinc-400">-</span>}
                                            </TableCell>
                                            <TableCell>{game.yellowCards || <span className="text-zinc-400">-</span>}</TableCell>
                                            <TableCell>{game.redCards || <span className="text-zinc-400">-</span>}</TableCell>
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
                    <span className="font-medium text-zinc-100">{sortedGames.length}</span>
                    <br />
                    <span className="text-zinc-400">of {sortedGames.length} results</span>
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

function ResultBadge({ homeScore, awayScore, isHome }: { homeScore: number; awayScore: number; isHome: boolean }) {
    const ourScore = isHome ? homeScore : awayScore;
    const theirScore = isHome ? awayScore : homeScore;
    
    let outcome: "win" | "draw" | "loss";
    if (ourScore > theirScore) outcome = "win";
    else if (ourScore === theirScore) outcome = "draw";
    else outcome = "loss";

    return (
        <span className={clsx(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
            outcome === "win" && "bg-green-100 text-green-700",
            outcome === "draw" && "bg-amber-100 text-amber-700",
            outcome === "loss" && "bg-red-100 text-red-700"
        )}>
            {homeScore} - {awayScore}
        </span>
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

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
    });
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

