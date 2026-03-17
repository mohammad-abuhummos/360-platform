import { Subheading } from "../heading";
import { Input, InputGroup } from "../input";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeader,
    TableCell,
} from "../table";
import { MagnifyingGlassIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

type ProfileRegistrationsTabProps = {
    memberId: string;
};

export function ProfileRegistrationsTab({ memberId }: ProfileRegistrationsTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <InputGroup className="max-w-xs">
                    <MagnifyingGlassIcon data-slot="icon" className="text-zinc-500" />
                    <Input
                        type="search"
                        placeholder="Search registrations..."
                        className="bg-zinc-800 text-white placeholder:text-zinc-500"
                    />
                </InputGroup>
            </div>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <Subheading level={3} className="mb-4 text-sm font-semibold text-white">
                    Registration submissions
                </Subheading>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader className="text-xs text-zinc-500">Date submitted</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Form name</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Submitted for</TableHeader>
                                <TableHeader className="text-xs text-zinc-500">Submitted by</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="py-16 text-center">
                                    <DocumentTextIcon className="mx-auto size-12 text-zinc-500" />
                                    <p className="mt-2 text-sm text-zinc-500">No registration submissions found</p>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <p className="mt-2 text-xs text-zinc-500">0 results</p>
            </section>
        </div>
    );
}
