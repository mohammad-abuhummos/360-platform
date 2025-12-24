import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

// Firebase config - using the same config as the app
const firebaseConfig = {
    apiKey: "AIzaSyAtxja0nrAKoqsE7E5W7_d3snPsrASRQ-8",
    authDomain: "platfrom-bf2a3.firebaseapp.com",
    projectId: "platfrom-bf2a3",
    storageBucket: "platfrom-bf2a3.firebasestorage.app",
    messagingSenderId: "962318157238",
    appId: "1:962318157238:web:f9183ade47cd60c494ed17",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Types
type GoalType = "open_play" | "set_piece" | "free_kick" | "corner" | "penalty" | "counter_attack";
type CardType = "yellow" | "red";
type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed";

// Sample data
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

const sampleCompetitions = [
    { name: "Premier Youth League", description: "Top tier youth league", format: "11v11" },
    { name: "Regional Cup", description: "Annual regional knockout tournament", format: "11v11" },
    { name: "International Youth Cup", description: "International youth tournament", format: "11v11" },
    { name: "Winter League", description: "Indoor winter competition", format: "5v5" },
];

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

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateGoals(homeScore: number, awayScore: number, players: typeof samplePlayers) {
    const goals = [];
    
    for (let i = 0; i < homeScore; i++) {
        const scorer = randomElement(players);
        const assister = randomElement(players.filter(p => p.id !== scorer.id));
        const hasAssist = Math.random() > 0.3;
        const goal: any = {
            id: `goal-home-${i}`,
            scorerId: scorer.id,
            scorerName: scorer.name,
            minute: randomInt(1, 90),
            goalType: randomElement(goalTypes),
            isOwnGoal: false,
            forTeam: "home",
        };
        if (hasAssist) {
            goal.assistId = assister.id;
            goal.assistName = assister.name;
        }
        goals.push(goal);
    }
    
    for (let i = 0; i < awayScore; i++) {
        goals.push({
            id: `goal-away-${i}`,
            scorerName: "Opponent Player",
            minute: randomInt(1, 90),
            goalType: randomElement(goalTypes),
            isOwnGoal: false,
            forTeam: "away",
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

function generatePlayerStats(players: typeof samplePlayers, goals: any[]) {
    return players.map((player, index) => {
        const started = index < 11;
        const playerGoals = goals.filter(g => g.scorerId === player.id);
        const playerAssists = goals.filter(g => g.assistId === player.id);
        
        const stat: any = {
            playerId: player.id,
            playerName: player.name,
            started,
            minutesPlayed: started ? randomInt(60, 90) : randomInt(0, 30),
            goals: playerGoals.length,
            assists: playerAssists.length,
            yellowCards: Math.random() > 0.85 ? 1 : 0,
            redCards: Math.random() > 0.95 ? 1 : 0,
        };
        
        // Only add substitution fields if they have values
        if (!started && Math.random() > 0.5) {
            stat.substitutedIn = randomInt(45, 80);
        }
        if (started && Math.random() > 0.7) {
            stat.substitutedOut = randomInt(60, 85);
        }
        
        return stat;
    });
}

async function seedGamesData(clubId: string) {
    try {
        console.log("🚀 Starting games seed for club:", clubId);
        
        // 1. Create opponents
        console.log("\n📋 Creating opponents...");
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
            console.log(`  ✓ Created opponent: ${opponent.name}`);
        }
        
        // 2. Create competitions
        console.log("\n🏆 Creating competitions...");
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
            console.log(`  ✓ Created competition: ${competition.name}`);
        }
        
        // 3. Create match results
        console.log("\n⚽ Creating match results...");
        const matchResults = [
            { homeScore: 3, awayScore: 1, isHome: true, daysAgo: 7, status: "completed" as MatchStatus },
            { homeScore: 2, awayScore: 0, isHome: true, daysAgo: 14, status: "completed" as MatchStatus },
            { homeScore: 1, awayScore: 2, isHome: false, daysAgo: 21, status: "completed" as MatchStatus },
            { homeScore: 2, awayScore: 2, isHome: true, daysAgo: 28, status: "completed" as MatchStatus },
            { homeScore: 4, awayScore: 1, isHome: true, daysAgo: 35, status: "completed" as MatchStatus },
            { homeScore: 0, awayScore: 1, isHome: false, daysAgo: 42, status: "completed" as MatchStatus },
            { homeScore: 3, awayScore: 2, isHome: true, daysAgo: 49, status: "completed" as MatchStatus },
            { homeScore: 1, awayScore: 1, isHome: false, daysAgo: 56, status: "completed" as MatchStatus },
            { homeScore: 2, awayScore: 0, isHome: true, daysAgo: 63, status: "completed" as MatchStatus },
            { homeScore: 3, awayScore: 0, isHome: true, daysAgo: 70, status: "completed" as MatchStatus },
            { homeScore: 0, awayScore: 2, isHome: false, daysAgo: 77, status: "completed" as MatchStatus },
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
            const playerStats = generatePlayerStats(samplePlayers, goals);
            
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
            
            const result = match.isHome 
                ? `${match.homeScore}-${match.awayScore}` 
                : `${match.awayScore}-${match.homeScore}`;
            const venue = match.isHome ? "(H)" : "(A)";
            console.log(`  ✓ Match ${i + 1}: vs ${opponent.name} ${result} ${venue}`);
        }
        
        console.log("\n✅ Games seed completed successfully!");
        console.log(`   - ${sampleOpponents.length} opponents created`);
        console.log(`   - ${sampleCompetitions.length} competitions created`);
        console.log(`   - ${matchResults.length} match results created`);
        
    } catch (error) {
        console.error("❌ Error seeding games data:", error);
        process.exit(1);
    }
}

// Get club ID from command line or use default
const clubId = process.argv[2] || "nPMC9AIuMzRlIcfXiCKG";

console.log("================================================");
console.log("     🎮 GAMES DATA SEED SCRIPT");
console.log("================================================");
console.log(`Club ID: ${clubId}\n`);

seedGamesData(clubId).then(() => {
    console.log("\n================================================");
    console.log("     SEED COMPLETE - Check Firebase Console");
    console.log("================================================");
    process.exit(0);
});

