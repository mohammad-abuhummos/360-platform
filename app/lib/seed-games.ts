import {
    addDoc,
    collection,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "~/lib/firebase";
import type { GoalType, CardType, MatchStatus } from "./firestore-games";

// Sample opponents
const sampleOpponents = [
    { name: "FC Barcelona Youth", logoUrl: "" },
    { name: "Real Madrid Academy", logoUrl: "" },
    { name: "Manchester United U18", logoUrl: "" },
    { name: "Ajax Youth", logoUrl: "" },
    { name: "Bayern Munich Academy", logoUrl: "" },
    { name: "PSG U19", logoUrl: "" },
    { name: "Juventus Youth", logoUrl: "" },
    { name: "Liverpool Academy", logoUrl: "" },
];

// Sample competitions
const sampleCompetitions = [
    { name: "Premier Youth League", description: "Top tier youth league", format: "11v11" as const },
    { name: "Regional Cup", description: "Annual regional knockout tournament", format: "11v11" as const },
    { name: "International Youth Cup", description: "International youth tournament", format: "11v11" as const },
    { name: "Winter League", description: "Indoor winter competition", format: "5v5" as const },
];

// Sample players
const samplePlayers = [
    { id: "player1", name: "James Wilson" },
    { id: "player2", name: "Marcus Johnson" },
    { id: "player3", name: "Oliver Smith" },
    { id: "player4", name: "Noah Brown" },
    { id: "player5", name: "Liam Davis" },
    { id: "player6", name: "Ethan Martinez" },
    { id: "player7", name: "Lucas Garcia" },
    { id: "player8", name: "Mason Rodriguez" },
    { id: "player9", name: "Alexander Lee" },
    { id: "player10", name: "Benjamin Taylor" },
    { id: "player11", name: "William Anderson" },
];

const goalTypes: GoalType[] = ["open_play", "set_piece", "free_kick", "corner", "penalty", "counter_attack"];
const cardTypes: CardType[] = ["yellow", "red"];

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateGoals(homeScore: number, awayScore: number, players: typeof samplePlayers) {
    const goals = [];
    
    // Home team goals
    for (let i = 0; i < homeScore; i++) {
        const scorer = randomElement(players);
        const assister = randomElement(players.filter(p => p.id !== scorer.id));
        goals.push({
            id: `goal-home-${i}`,
            scorerId: scorer.id,
            scorerName: scorer.name,
            assistId: Math.random() > 0.3 ? assister.id : undefined,
            assistName: Math.random() > 0.3 ? assister.name : undefined,
            minute: randomInt(1, 90),
            goalType: randomElement(goalTypes),
            isOwnGoal: false,
            forTeam: "home" as const,
        });
    }
    
    // Away team goals
    for (let i = 0; i < awayScore; i++) {
        goals.push({
            id: `goal-away-${i}`,
            scorerName: "Opponent Player",
            minute: randomInt(1, 90),
            goalType: randomElement(goalTypes),
            isOwnGoal: false,
            forTeam: "away" as const,
        });
    }
    
    return goals.sort((a, b) => a.minute - b.minute);
}

function generateCards(players: typeof samplePlayers) {
    const cards = [];
    const numCards = randomInt(0, 4);
    
    for (let i = 0; i < numCards; i++) {
        const player = randomElement(players);
        cards.push({
            id: `card-${i}`,
            playerId: player.id,
            playerName: player.name,
            cardType: Math.random() > 0.8 ? "red" : "yellow" as CardType,
            minute: randomInt(1, 90),
            reason: randomElement(["Foul", "Unsporting behavior", "Time wasting", "Handball"]),
        });
    }
    
    return cards.sort((a, b) => a.minute - b.minute);
}

function generatePlayerStats(players: typeof samplePlayers, homeScore: number, goals: any[]) {
    return players.map((player, index) => {
        const started = index < 11;
        const playerGoals = goals.filter(g => g.scorerId === player.id);
        const playerAssists = goals.filter(g => g.assistId === player.id);
        
        return {
            playerId: player.id,
            playerName: player.name,
            started,
            minutesPlayed: started ? randomInt(60, 90) : randomInt(0, 30),
            goals: playerGoals.length,
            assists: playerAssists.length,
            yellowCards: Math.random() > 0.85 ? 1 : 0,
            redCards: Math.random() > 0.95 ? 1 : 0,
            substitutedIn: !started && Math.random() > 0.5 ? randomInt(45, 80) : undefined,
            substitutedOut: started && Math.random() > 0.7 ? randomInt(60, 85) : undefined,
        };
    });
}

export async function seedGamesData(clubId: string): Promise<{ success: boolean; message: string }> {
    try {
        console.log("Starting games seed for club:", clubId);
        
        // 1. Create opponents
        const opponentIds: string[] = [];
        for (const opponent of sampleOpponents) {
            const opponentRef = await addDoc(collection(db, `clubs/${clubId}/opponents`), {
                clubId,
                name: opponent.name,
                logoUrl: opponent.logoUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            opponentIds.push(opponentRef.id);
            console.log("Created opponent:", opponent.name);
        }
        
        // 2. Create competitions
        const competitionIds: string[] = [];
        for (const competition of sampleCompetitions) {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 6);
            
            const competitionRef = await addDoc(collection(db, `clubs/${clubId}/competitions`), {
                clubId,
                name: competition.name,
                description: competition.description,
                format: competition.format,
                startDate: Timestamp.fromDate(startDate),
                endDate: Timestamp.fromDate(endDate),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            competitionIds.push(competitionRef.id);
            console.log("Created competition:", competition.name);
        }
        
        // 3. Create match results (past games)
        const matchResults = [
            // Wins
            { homeScore: 3, awayScore: 1, isHome: true, daysAgo: 7, status: "completed" as MatchStatus },
            { homeScore: 2, awayScore: 0, isHome: true, daysAgo: 14, status: "completed" as MatchStatus },
            { homeScore: 1, awayScore: 2, isHome: false, daysAgo: 21, status: "completed" as MatchStatus }, // Loss
            { homeScore: 2, awayScore: 2, isHome: true, daysAgo: 28, status: "completed" as MatchStatus }, // Draw
            { homeScore: 4, awayScore: 1, isHome: true, daysAgo: 35, status: "completed" as MatchStatus },
            { homeScore: 0, awayScore: 1, isHome: false, daysAgo: 42, status: "completed" as MatchStatus }, // Loss
            { homeScore: 3, awayScore: 2, isHome: true, daysAgo: 49, status: "completed" as MatchStatus },
            { homeScore: 1, awayScore: 1, isHome: false, daysAgo: 56, status: "completed" as MatchStatus }, // Draw
            { homeScore: 2, awayScore: 0, isHome: true, daysAgo: 63, status: "completed" as MatchStatus },
            { homeScore: 3, awayScore: 0, isHome: true, daysAgo: 70, status: "completed" as MatchStatus },
            { homeScore: 0, awayScore: 2, isHome: false, daysAgo: 77, status: "completed" as MatchStatus }, // Loss
            { homeScore: 4, awayScore: 2, isHome: true, daysAgo: 84, status: "completed" as MatchStatus },
        ];
        
        for (let i = 0; i < matchResults.length; i++) {
            const match = matchResults[i];
            const opponent = sampleOpponents[i % sampleOpponents.length];
            const competition = sampleCompetitions[i % sampleCompetitions.length];
            const matchDate = new Date();
            matchDate.setDate(matchDate.getDate() - match.daysAgo);
            
            const goals = generateGoals(
                match.isHome ? match.homeScore : match.awayScore,
                match.isHome ? match.awayScore : match.homeScore,
                samplePlayers
            );
            const cards = generateCards(samplePlayers);
            const playerStats = generatePlayerStats(samplePlayers, match.isHome ? match.homeScore : match.awayScore, goals);
            
            await addDoc(collection(db, `clubs/${clubId}/matchResults`), {
                clubId,
                eventId: `event-${i}`,
                competitionId: competitionIds[i % competitionIds.length],
                competitionName: competition.name,
                opponentId: opponentIds[i % opponentIds.length],
                opponentName: opponent.name,
                opponentLogoUrl: opponent.logoUrl,
                matchDate: Timestamp.fromDate(matchDate),
                isHome: match.isHome,
                status: match.status,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                halfTimeHomeScore: Math.floor(match.homeScore / 2),
                halfTimeAwayScore: Math.floor(match.awayScore / 2),
                goals,
                cards,
                playerStats,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            console.log(`Created match ${i + 1}:`, opponent.name, `${match.homeScore}-${match.awayScore}`);
        }
        
        console.log("Games seed completed successfully!");
        return { success: true, message: `Created ${sampleOpponents.length} opponents, ${sampleCompetitions.length} competitions, and ${matchResults.length} match results` };
        
    } catch (error) {
        console.error("Error seeding games data:", error);
        return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
}

// Export for use in components
export { samplePlayers, sampleOpponents, sampleCompetitions };

