import { Skeleton } from "@/components/ui/skeleton";

export const TicketItemSkeleton = () => {
    return (
        <div className="p-4 flex flex-col gap-2 border-b">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
            </div>
        </div>
    );
};
