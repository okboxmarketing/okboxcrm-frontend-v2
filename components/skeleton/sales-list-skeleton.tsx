import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export const SalesListSkeleton = () => {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Valor Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(6)].map((_, idx) => (
                        <TableRow key={idx}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
