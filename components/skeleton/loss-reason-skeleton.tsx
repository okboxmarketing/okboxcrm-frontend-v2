import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

export const LossReasonListSkeleton = () => {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(6)].map((_, idx) => (
                        <TableRow key={idx}>
                            <TableCell>
                                <Skeleton className="h-4 w-48" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-20 rounded" />
                                    <Skeleton className="h-8 w-20 rounded" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};