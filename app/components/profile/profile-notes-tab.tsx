import { Subheading } from "../heading";
import { Text } from "../text";
import { Input, InputGroup } from "../input";
import { Button } from "../button";
import { MagnifyingGlassIcon, FunnelIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

type ProfileNotesTabProps = {
    memberId: string;
};

export function ProfileNotesTab({ memberId }: ProfileNotesTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <InputGroup className="max-w-xs">
                    <MagnifyingGlassIcon data-slot="icon" className="text-zinc-500" />
                    <Input
                        type="search"
                        placeholder="Search notes..."
                        className="bg-zinc-800 text-white placeholder:text-zinc-500"
                    />
                </InputGroup>
                <Button plain className="!p-2">
                    <FunnelIcon className="size-5" />
                </Button>
                <Button color="amber" className="ml-auto">
                    <PlusIcon className="size-4" data-slot="icon" />
                    Add note
                </Button>
            </div>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-8">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Notes
                </Subheading>
                <div className="flex flex-col items-center justify-center py-16">
                    <DocumentTextIcon className="size-16 text-zinc-500" />
                    <Text className="mt-4 text-sm text-zinc-500">No notes yet</Text>
                </div>
            </section>
        </div>
    );
}
