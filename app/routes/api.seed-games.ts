import type { Route } from "./+types/api.seed-games";
import { seedGamesData } from "~/lib/seed-games";

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        const clubId = body.clubId;

        if (!clubId) {
            return Response.json({ error: "Club ID is required" }, { status: 400 });
        }

        const result = await seedGamesData(clubId);
        return Response.json(result);
    } catch (error) {
        console.error("Seed error:", error);
        return Response.json(
            { success: false, message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

