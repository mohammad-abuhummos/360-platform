/**
 * Seed Test Users Script
 * 
 * Run this script to add test users to Firestore and assign them to clubs.
 * 
 * Usage: npx tsx scripts/seed-test-users.ts
 */

import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    setDoc,
    getDocs,
    collection,
    arrayUnion,
    serverTimestamp,
} from "firebase/firestore";

// Firebase configuration (same as app)
const firebaseConfig = {
    apiKey: "AIzaSyAtxja0nrAKoqsE7E5W7_d3snPsrASRQ-8",
    authDomain: "platfrom-bf2a3.firebaseapp.com",
    projectId: "platfrom-bf2a3",
    storageBucket: "platfrom-bf2a3.firebasestorage.app",
    messagingSenderId: "962318157238",
    appId: "1:962318157238:web:f9183ade47cd60c494ed17",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Test users with their UIDs from Firebase Auth Console
 */
const TEST_USERS = [
    {
        uid: "l7u1jyz3zXckF9jO61Gs8iMqn0N2",
        email: "test1@test.com",
        displayName: "Test Player 1",
        role: "player" as const,
        clubSlugs: ["club-lobby", "amman", "dev"],
    },
    {
        uid: "XD12nl3hMXNmvj4wn62dwsR2Btj2",
        email: "test2@test.com",
        displayName: "Test Player 2",
        role: "player" as const,
        clubSlugs: ["club-lobby", "grassroots", "al-aqaba"],
    },
    {
        uid: "AqA6i82WnONhSb1vNSk5bdevHPu1",
        email: "test3@test.com",
        displayName: "Test Staff 3",
        role: "staff" as const,
        clubSlugs: ["club-lobby", "2021", "jordan-knights-football-club", "club-youth-teams"],
    },
    {
        uid: "JRyK6J1dk2hxhyXQAKuj12CYUDg1",
        email: "test4@test.com",
        displayName: "Test Staff 4",
        role: "staff" as const,
        clubSlugs: ["club-lobby", "2021", "al-ramtha", "al-salt"],
    },
    {
        uid: "5CHgZtPIhWcxtR9sXOfDku7Au883",
        email: "test5@test.com",
        displayName: "Test Admin 5",
        role: "admin" as const,
        clubSlugs: [
            "club-lobby",
            "jordan-knights-football-club",
            "2021",
            "al-aqaba",
            "al-ramtha",
            "al-salt",
            "amman",
            "club-youth-teams",
            "dev",
            "grassroots",
        ],
    },
];

// Membership role mapping based on user role
const MEMBERSHIP_ROLE_MAP = {
    admin: "Administrator",
    staff: "Staff",
    player: "Player",
} as const;

type MembershipRole = "Administrator" | "Staff" | "Player";

async function fetchExistingClubs(): Promise<Map<string, string>> {
    console.log("📂 Fetching existing clubs from Firestore...\n");

    const clubsRef = collection(db, "clubs");
    const snapshot = await getDocs(clubsRef);

    // Map slug -> full club ID
    const clubMap = new Map<string, string>();

    snapshot.docs.forEach((doc) => {
        const clubId = doc.id;
        // Extract slug from club ID (format: {ownerUid}-{slug})
        const parts = clubId.split("-");
        if (parts.length >= 2) {
            const slug = parts.slice(1).join("-"); // Everything after first dash is the slug
            clubMap.set(slug, clubId);
            console.log(`  Found club: ${slug} -> ${clubId}`);
        }
    });

    console.log(`\n📊 Total clubs found: ${clubMap.size}\n`);
    return clubMap;
}

async function seedTestUsers() {
    console.log("🌱 Starting test user seeding...\n");
    console.log("═".repeat(60) + "\n");

    // First, fetch all existing clubs to get correct IDs
    const clubMap = await fetchExistingClubs();

    if (clubMap.size === 0) {
        console.error("❌ No clubs found in Firestore! Please create clubs first.");
        process.exit(1);
    }

    console.log("═".repeat(60));
    console.log("\n👥 Processing test users...\n");

    for (const user of TEST_USERS) {
        console.log(`\n👤 Processing ${user.email} (${user.role})...`);

        // Get actual club IDs from the map
        const clubIds: string[] = [];
        const missingClubs: string[] = [];

        for (const slug of user.clubSlugs) {
            const clubId = clubMap.get(slug);
            if (clubId) {
                clubIds.push(clubId);
            } else {
                missingClubs.push(slug);
            }
        }

        if (missingClubs.length > 0) {
            console.log(`  ⚠️  Missing clubs: ${missingClubs.join(", ")}`);
        }

        if (clubIds.length === 0) {
            console.log(`  ❌ No valid clubs found for user, skipping...`);
            continue;
        }

        const activeClubId = clubIds[0];

        // 1. Create/update user document in 'users' collection
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            clubIds: clubIds,
            activeClubId: activeClubId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log(`  ✅ Created user document`);

        // 2. Add user to each club's memberIds and memberships
        const membershipRole: MembershipRole = MEMBERSHIP_ROLE_MAP[user.role];

        for (const clubId of clubIds) {
            const clubRef = doc(db, "clubs", clubId);
            const slug = clubId.split("-").slice(1).join("-");

            try {
                // Use setDoc with merge to update without requiring doc to exist
                await setDoc(clubRef, {
                    memberIds: arrayUnion(user.uid),
                    [`memberships.${user.uid}`]: {
                        role: membershipRole,
                        status: "active",
                        assignedAt: serverTimestamp(),
                    },
                    updatedAt: serverTimestamp(),
                }, { merge: true });

                console.log(`  ✅ Added to club: ${slug}`);
            } catch (error) {
                console.log(`  ❌ Error adding to club: ${slug}`);
                console.error(error);
            }
        }
    }

    console.log("\n\n" + "═".repeat(60));
    console.log("✨ Test user seeding completed!");
    console.log("═".repeat(60));
    console.log("\n📋 Summary:");
    console.log("━".repeat(60));
    console.log("  Email                | Role   | Clubs");
    console.log("━".repeat(60));
    TEST_USERS.forEach((user) => {
        console.log(`  ${user.email.padEnd(20)} | ${user.role.padEnd(6)} | ${user.clubSlugs.length} clubs`);
    });
    console.log("━".repeat(60));

    process.exit(0);
}

// Run the seed function
seedTestUsers().catch((error) => {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
});
