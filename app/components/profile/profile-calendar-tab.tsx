import { Subheading } from "../heading";
import { Text } from "../text";
import { Button } from "../button";
import { Select } from "../select";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

type ProfileCalendarTabProps = {
    memberId: string;
};

export function ProfileCalendarTab({ memberId }: ProfileCalendarTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <Select className="w-40 bg-zinc-800 text-white">
                    <option>From today</option>
                    <option>This week</option>
                    <option>This month</option>
                </Select>
                <Button plain className="text-sm">
                    Subscribe
                </Button>
            </div>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Upcoming events
                </Subheading>
                <div className="flex flex-col items-center justify-center py-16">
                    <CalendarDaysIcon className="size-16 text-zinc-500" />
                    <Text className="mt-4 text-sm text-zinc-500">Nothing planned for today</Text>
                </div>
            </section>
        </div>
    );
}
