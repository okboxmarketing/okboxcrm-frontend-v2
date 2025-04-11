import { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const KanbanStepsSkeleton = () => {
    return (
        <Fragment>
            <div className="relative">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-2/6">Nome</TableHead>
                            <TableHead className="w-1/6">Cor</TableHead>
                            <TableHead className="w-1/6">Tickets</TableHead>
                            <TableHead className="w-2/6">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>
            <div className="grid [grid-template-columns:2fr_1fr_1fr_2fr] gap-4 mt-4">
                {[...Array(5)].map((_, index) => (
                    <Fragment key={index}>
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-1/3" />
                    </Fragment>
                ))}
            </div>
        </Fragment>
    );
};