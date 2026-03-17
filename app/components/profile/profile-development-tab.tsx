import { Subheading } from "../heading";
import { Text } from "../text";
import { Button } from "../button";
import { ChartBarIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

type ProfileDevelopmentTabProps = {
    memberId: string;
    isPlayer: boolean;
};

export function ProfileDevelopmentTab({ memberId, isPlayer }: ProfileDevelopmentTabProps) {
    if (!isPlayer) {
        return (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-8 text-center">
                <Text className="text-zinc-500">Development tracking is available for players only.</Text>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <Subheading level={3} className="text-sm font-semibold text-white">
                        Active goals
                    </Subheading>
                    <Button plain className="!p-1.5 text-sm">
                        <PlusIcon className="size-4" data-slot="icon" />
                        Add goal
                    </Button>
                </div>
                <EmptyBlock message="No active goals" />
            </section>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Latest review
                </Subheading>
                <EmptyBlock message="No reviews yet" />
            </section>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Assessments
                </Subheading>
                <div className="rounded-lg border border-dashed border-zinc-600 bg-zinc-800/30 p-8 text-center">
                    <ClipboardDocumentListIcon className="mx-auto size-12 text-zinc-500" />
                    <Text className="mt-2 text-sm text-zinc-500">No assessments</Text>
                    <Text className="mt-1 text-xs text-zinc-600">Position map and training priorities will appear here</Text>
                </div>
            </section>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Spider chart
                </Subheading>
                <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-zinc-600 bg-zinc-800/30">
                    <ChartBarIcon className="size-16 text-zinc-500" />
                </div>
                <Text className="mt-2 text-center text-xs text-zinc-500">No data available</Text>
            </section>
        </div>
    );
}

function EmptyBlock({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed border-zinc-600 bg-zinc-800/30 py-8 text-center">
            <Text className="text-sm text-zinc-500">{message}</Text>
        </div>
    );
}
