import { Subheading } from "../heading";
import { Text } from "../text";
import { Input, InputGroup } from "../input";
import { VideoCameraIcon } from "@heroicons/react/24/outline";

type ProfileVideoTabProps = {
    memberId: string;
    isPlayer: boolean;
};

export function ProfileVideoTab({ memberId, isPlayer }: ProfileVideoTabProps) {
    return (
        <div className="space-y-4">
            <InputGroup className="max-w-xs">
                <VideoCameraIcon data-slot="icon" className="text-zinc-500" />
                <Input
                    type="search"
                    placeholder="Search videos..."
                    className="bg-zinc-800 text-white placeholder:text-zinc-500"
                />
            </InputGroup>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-8">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Tagged videos
                </Subheading>
                <div className="flex flex-col items-center justify-center py-16">
                    <VideoCameraIcon className="size-16 text-zinc-500" />
                    <Text className="mt-4 text-sm text-zinc-500">No tagged videos for this profile</Text>
                </div>
            </section>
        </div>
    );
}
