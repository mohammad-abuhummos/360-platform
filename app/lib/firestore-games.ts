import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    type DocumentData,
    type FirestoreError,
    type QueryDocumentSnapshot,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "~/lib/firebase";

// ==================== Types ====================

export type GameFormat = "11v11" | "9v9" | "7v7" | "5v5" | "futsal";

export type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed";

export type CardType = "yellow" | "red";

export type GoalType = "open_play" | "set_piece" | "free_kick" | "corner" | "penalty" | "counter_attack" | "throw_in" | "kick_off" | "own_goal";

// Competition type
export type Competition = {
    id: string;
    clubId: string;
    name: string;
    description?: string;
    format?: GameFormat;
    startDate?: Timestamp;
    endDate?: Timestamp;
    imageUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// Opponent team type
export type Opponent = {
    id: string;
    clubId: string;
    name: string;
    logoUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// Card event (yellow/red card)
export type CardEvent = {
    id: string;
    playerId: string;
    playerName: string;
    cardType: CardType;
    minute: number;
    reason?: string;
};

// Goal event
export type GoalEvent = {
    id: string;
    scorerId?: string;
    scorerName?: string;
    assistId?: string;
    assistName?: string;
    minute: number;
    goalType: GoalType;
    isOwnGoal: boolean;
    forTeam: "home" | "away";
};

// Player match stats
export type PlayerMatchStats = {
    playerId: string;
    playerName: string;
    started: boolean;
    minutesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    substitutedIn?: number; // minute
    substitutedOut?: number; // minute
};

// Match result - extends event game details with score and stats
export type MatchResult = {
    id: string;
    clubId: string;
    eventId: string; // Link to calendar event
    competitionId?: string;
    competitionName?: string;
    opponentId?: string;
    opponentName: string;
    opponentLogoUrl?: string;
    matchDate: Timestamp;
    isHome: boolean;
    status: MatchStatus;
    // Scores
    homeScore: number;
    awayScore: number;
    halfTimeHomeScore?: number;
    halfTimeAwayScore?: number;
    // Match events
    goals: GoalEvent[];
    cards: CardEvent[];
    // Player stats
    playerStats: PlayerMatchStats[];
    // Metadata
    notes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

// Aggregated player statistics
export type PlayerSeasonStats = {
    playerId: string;
    playerName: string;
    gamesPlayed: number;
    starts: number;
    minutesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    totalPoints: number; // goals + assists
};

// Team statistics overview
export type TeamStats = {
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    goalDifference: number;
    winRate: number;
    cleanSheets: number;
    // Goals by type
    goalsByType: Record<GoalType, number>;
    // Cards
    yellowCards: number;
    redCards: number;
};

// ==================== Helper Functions ====================

function getCompetitionsCollectionPath(clubId: string) {
    return `clubs/${clubId}/competitions`;
}

function getOpponentsCollectionPath(clubId: string) {
    return `clubs/${clubId}/opponents`;
}

function getMatchResultsCollectionPath(clubId: string) {
    return `clubs/${clubId}/matchResults`;
}

function mapDocToCompetition(doc: QueryDocumentSnapshot<DocumentData>): Competition {
    const data = doc.data();
    return {
        id: doc.id,
        clubId: data.clubId,
        name: data.name,
        description: data.description,
        format: data.format,
        startDate: data.startDate,
        endDate: data.endDate,
        imageUrl: data.imageUrl,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

function mapDocToOpponent(doc: QueryDocumentSnapshot<DocumentData>): Opponent {
    const data = doc.data();
    return {
        id: doc.id,
        clubId: data.clubId,
        name: data.name,
        logoUrl: data.logoUrl,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

function mapDocToMatchResult(doc: QueryDocumentSnapshot<DocumentData>): MatchResult {
    const data = doc.data();
    return {
        id: doc.id,
        clubId: data.clubId,
        eventId: data.eventId,
        competitionId: data.competitionId,
        competitionName: data.competitionName,
        opponentId: data.opponentId,
        opponentName: data.opponentName,
        opponentLogoUrl: data.opponentLogoUrl,
        matchDate: data.matchDate,
        isHome: data.isHome ?? true,
        status: data.status ?? "scheduled",
        homeScore: data.homeScore ?? 0,
        awayScore: data.awayScore ?? 0,
        halfTimeHomeScore: data.halfTimeHomeScore,
        halfTimeAwayScore: data.halfTimeAwayScore,
        goals: data.goals ?? [],
        cards: data.cards ?? [],
        playerStats: data.playerStats ?? [],
        notes: data.notes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
}

// ==================== Competition CRUD ====================

export async function createCompetition(
    clubId: string,
    data: Omit<Competition, "id" | "clubId" | "createdAt" | "updatedAt">
): Promise<string> {
    const collectionPath = getCompetitionsCollectionPath(clubId);
    const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        clubId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateCompetition(
    clubId: string,
    competitionId: string,
    updates: Partial<Omit<Competition, "id" | "clubId" | "createdAt" | "updatedAt">>
): Promise<void> {
    const docRef = doc(db, getCompetitionsCollectionPath(clubId), competitionId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteCompetition(clubId: string, competitionId: string): Promise<void> {
    const docRef = doc(db, getCompetitionsCollectionPath(clubId), competitionId);
    await deleteDoc(docRef);
}

export function subscribeToCompetitions(
    clubId: string,
    onData: (competitions: Competition[]) => void,
    onError?: (error: FirestoreError) => void
): Unsubscribe {
    const q = query(
        collection(db, getCompetitionsCollectionPath(clubId)),
        orderBy("name", "asc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const competitions = snapshot.docs.map(mapDocToCompetition);
            onData(competitions);
        },
        onError
    );
}

export async function getCompetitions(clubId: string): Promise<Competition[]> {
    const q = query(
        collection(db, getCompetitionsCollectionPath(clubId)),
        orderBy("name", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToCompetition);
}

// ==================== Opponent CRUD ====================

export async function createOpponent(
    clubId: string,
    data: Omit<Opponent, "id" | "clubId" | "createdAt" | "updatedAt">
): Promise<string> {
    const collectionPath = getOpponentsCollectionPath(clubId);
    const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        clubId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateOpponent(
    clubId: string,
    opponentId: string,
    updates: Partial<Omit<Opponent, "id" | "clubId" | "createdAt" | "updatedAt">>
): Promise<void> {
    const docRef = doc(db, getOpponentsCollectionPath(clubId), opponentId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteOpponent(clubId: string, opponentId: string): Promise<void> {
    const docRef = doc(db, getOpponentsCollectionPath(clubId), opponentId);
    await deleteDoc(docRef);
}

export function subscribeToOpponents(
    clubId: string,
    onData: (opponents: Opponent[]) => void,
    onError?: (error: FirestoreError) => void
): Unsubscribe {
    const q = query(
        collection(db, getOpponentsCollectionPath(clubId)),
        orderBy("name", "asc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const opponents = snapshot.docs.map(mapDocToOpponent);
            onData(opponents);
        },
        onError
    );
}

export async function getOpponents(clubId: string): Promise<Opponent[]> {
    const q = query(
        collection(db, getOpponentsCollectionPath(clubId)),
        orderBy("name", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToOpponent);
}

// ==================== Match Result CRUD ====================

export async function createMatchResult(
    clubId: string,
    data: Omit<MatchResult, "id" | "clubId" | "createdAt" | "updatedAt">
): Promise<string> {
    const collectionPath = getMatchResultsCollectionPath(clubId);
    const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        clubId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getMatchResult(clubId: string, matchId: string): Promise<MatchResult | null> {
    const docRef = doc(db, getMatchResultsCollectionPath(clubId), matchId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return mapDocToMatchResult(docSnap as QueryDocumentSnapshot<DocumentData>);
}

export async function getMatchResultByEventId(clubId: string, eventId: string): Promise<MatchResult | null> {
    const q = query(
        collection(db, getMatchResultsCollectionPath(clubId)),
        where("eventId", "==", eventId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return null;
    }

    return mapDocToMatchResult(snapshot.docs[0]);
}

export async function updateMatchResult(
    clubId: string,
    matchId: string,
    updates: Partial<Omit<MatchResult, "id" | "clubId" | "createdAt" | "updatedAt">>
): Promise<void> {
    const docRef = doc(db, getMatchResultsCollectionPath(clubId), matchId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteMatchResult(clubId: string, matchId: string): Promise<void> {
    const docRef = doc(db, getMatchResultsCollectionPath(clubId), matchId);
    await deleteDoc(docRef);
}

export function subscribeToMatchResults(
    clubId: string,
    onData: (results: MatchResult[]) => void,
    onError?: (error: FirestoreError) => void,
    dateRange?: { start: Date; end: Date }
): Unsubscribe {
    let q = query(
        collection(db, getMatchResultsCollectionPath(clubId)),
        orderBy("matchDate", "desc")
    );

    if (dateRange) {
        q = query(
            collection(db, getMatchResultsCollectionPath(clubId)),
            where("matchDate", ">=", dateRange.start),
            where("matchDate", "<=", dateRange.end),
            orderBy("matchDate", "desc")
        );
    }

    return onSnapshot(
        q,
        (snapshot) => {
            const results = snapshot.docs.map(mapDocToMatchResult);
            onData(results);
        },
        onError
    );
}

export async function getMatchResults(
    clubId: string,
    dateRange?: { start: Date; end: Date }
): Promise<MatchResult[]> {
    let q = query(
        collection(db, getMatchResultsCollectionPath(clubId)),
        orderBy("matchDate", "desc")
    );

    if (dateRange) {
        q = query(
            collection(db, getMatchResultsCollectionPath(clubId)),
            where("matchDate", ">=", dateRange.start),
            where("matchDate", "<=", dateRange.end),
            orderBy("matchDate", "desc")
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToMatchResult);
}

// ==================== Match Events ====================

export async function addGoalToMatch(
    clubId: string,
    matchId: string,
    goal: Omit<GoalEvent, "id">
): Promise<void> {
    const match = await getMatchResult(clubId, matchId);
    if (!match) throw new Error("Match not found");

    const newGoal: GoalEvent = {
        ...goal,
        id: generateId(),
    };

    const goals = [...match.goals, newGoal];
    
    // Recalculate scores
    const homeScore = goals.filter(g => g.forTeam === "home").length;
    const awayScore = goals.filter(g => g.forTeam === "away").length;

    await updateMatchResult(clubId, matchId, { goals, homeScore, awayScore });
}

export async function removeGoalFromMatch(
    clubId: string,
    matchId: string,
    goalId: string
): Promise<void> {
    const match = await getMatchResult(clubId, matchId);
    if (!match) throw new Error("Match not found");

    const goals = match.goals.filter(g => g.id !== goalId);
    
    const homeScore = goals.filter(g => g.forTeam === "home").length;
    const awayScore = goals.filter(g => g.forTeam === "away").length;

    await updateMatchResult(clubId, matchId, { goals, homeScore, awayScore });
}

export async function addCardToMatch(
    clubId: string,
    matchId: string,
    card: Omit<CardEvent, "id">
): Promise<void> {
    const match = await getMatchResult(clubId, matchId);
    if (!match) throw new Error("Match not found");

    const newCard: CardEvent = {
        ...card,
        id: generateId(),
    };

    const cards = [...match.cards, newCard];
    await updateMatchResult(clubId, matchId, { cards });
}

export async function removeCardFromMatch(
    clubId: string,
    matchId: string,
    cardId: string
): Promise<void> {
    const match = await getMatchResult(clubId, matchId);
    if (!match) throw new Error("Match not found");

    const cards = match.cards.filter(c => c.id !== cardId);
    await updateMatchResult(clubId, matchId, { cards });
}

export async function endMatch(
    clubId: string,
    matchId: string,
    finalScore: { home: number; away: number }
): Promise<void> {
    await updateMatchResult(clubId, matchId, {
        status: "completed",
        homeScore: finalScore.home,
        awayScore: finalScore.away,
    });
}

// ==================== Statistics Calculation ====================

export function calculateTeamStats(matches: MatchResult[], clubName?: string): TeamStats {
    const completedMatches = matches.filter(m => m.status === "completed");
    
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let cleanSheets = 0;
    let yellowCards = 0;
    let redCards = 0;
    const goalsByType: Record<GoalType, number> = {
        open_play: 0,
        set_piece: 0,
        free_kick: 0,
        corner: 0,
        penalty: 0,
        counter_attack: 0,
        throw_in: 0,
        kick_off: 0,
        own_goal: 0,
    };

    completedMatches.forEach(match => {
        const ourScore = match.isHome ? match.homeScore : match.awayScore;
        const theirScore = match.isHome ? match.awayScore : match.homeScore;

        if (ourScore > theirScore) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;

        goalsScored += ourScore;
        goalsConceded += theirScore;

        if (theirScore === 0) cleanSheets++;

        // Count cards
        match.cards.forEach(card => {
            if (card.cardType === "yellow") yellowCards++;
            else redCards++;
        });

        // Count goals by type
        const ourTeam = match.isHome ? "home" : "away";
        match.goals
            .filter(g => g.forTeam === ourTeam)
            .forEach(g => {
                goalsByType[g.goalType]++;
            });
    });

    const gamesPlayed = completedMatches.length;

    return {
        gamesPlayed,
        wins,
        draws,
        losses,
        goalsScored,
        goalsConceded,
        goalDifference: goalsScored - goalsConceded,
        winRate: gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0,
        cleanSheets,
        goalsByType,
        yellowCards,
        redCards,
    };
}

export function calculatePlayerStats(matches: MatchResult[]): PlayerSeasonStats[] {
    const statsMap = new Map<string, PlayerSeasonStats>();

    const completedMatches = matches.filter(m => m.status === "completed");

    completedMatches.forEach(match => {
        match.playerStats.forEach(ps => {
            const existing = statsMap.get(ps.playerId) || {
                playerId: ps.playerId,
                playerName: ps.playerName,
                gamesPlayed: 0,
                starts: 0,
                minutesPlayed: 0,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                totalPoints: 0,
            };

            existing.gamesPlayed++;
            if (ps.started) existing.starts++;
            existing.minutesPlayed += ps.minutesPlayed;
            existing.goals += ps.goals;
            existing.assists += ps.assists;
            existing.yellowCards += ps.yellowCards;
            existing.redCards += ps.redCards;
            existing.totalPoints = existing.goals + existing.assists;

            statsMap.set(ps.playerId, existing);
        });
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
}

// ==================== Utility Functions ====================

function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getMatchOutcome(match: MatchResult): "win" | "draw" | "loss" {
    const ourScore = match.isHome ? match.homeScore : match.awayScore;
    const theirScore = match.isHome ? match.awayScore : match.homeScore;

    if (ourScore > theirScore) return "win";
    if (ourScore === theirScore) return "draw";
    return "loss";
}

export function formatMatchScore(match: MatchResult): string {
    return `${match.homeScore} - ${match.awayScore}`;
}

export const goalTypeLabels: Record<GoalType, string> = {
    open_play: "Open Play",
    set_piece: "Set Piece",
    free_kick: "Free Kick",
    corner: "Corner",
    penalty: "Penalty",
    counter_attack: "Counter Attack",
    throw_in: "Throw In",
    kick_off: "Kick Off",
    own_goal: "Own Goal",
};

export const matchStatusLabels: Record<MatchStatus, string> = {
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    postponed: "Postponed",
};

export const gameFormatLabels: Record<GameFormat, string> = {
    "11v11": "11v11",
    "9v9": "9v9",
    "7v7": "7v7",
    "5v5": "5v5",
    futsal: "Futsal",
};

