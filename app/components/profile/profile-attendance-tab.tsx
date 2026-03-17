import { Subheading } from "../heading";
import { Text } from "../text";
import { Input, InputGroup } from "../input";
import { Button } from "../button";
import { Badge } from "../badge";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeader,
    TableCell,
} from "../table";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

type ProfileAttendanceTabProps = {
    memberId: string;
    isPlayer: boolean;
};

export function ProfileAttendanceTab({ memberId, isPlayer }: ProfileAttendanceTabProps) {
    if (!isPlayer) {
        return (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-8 text-center">
                <Text className="text-zinc-500">Attendance tracking is available for players only.</Text>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <InputGroup className="max-w-xs">
                    <MagnifyingGlassIcon data-slot="icon" className="text-zinc-500" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="bg-zinc-800 text-white placeholder:text-zinc-500"
                    />
                </InputGroup>
                <Input type="date" className="w-40 bg-zinc-800 text-white" />
                <span className="text-zinc-500">–</span>
                <Input type="date" className="w-40 bg-zinc-800 text-white" />
                <Button plain className="!p-2">
                    <FunnelIcon className="size-5" />
                </Button>
            </div>

            <div className="flex flex-wrap gap-4">
                <StatBadge label="Total events" value={0} />
                <StatBadge label="Attended" value={0} />
                <StatBadge label="Absent" value={0} />
                <StatBadge label="Unhandled" value={0} />
            </div>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Attendance history
                </Subheading>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader className="text-xs text-zinc-500">Date</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Time</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Event title</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Group</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Event type</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Status</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Comment</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={7} className="py-16 text-center text-sm text-zinc-500">
                                    No attendance records found
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </section>
        </div>
    );
}

function StatBadge({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg bg-zinc-800 px-4 py-2">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className="ml-2 font-semibold text-white">{value}</span>
        </div>
    );
}
