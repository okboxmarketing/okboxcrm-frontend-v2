import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardCardSkeletonProps {
    showIcon?: boolean;
    showSubtitle?: boolean;
    height?: string;
}

export function DashboardCardSkeleton({
    showIcon = true,
    showSubtitle = false,
    height = "h-[120px]"
}: DashboardCardSkeletonProps) {
    return (
        <Card className={`bg-white border-zinc-200 ${height}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    {showIcon && <Skeleton className="h-5 w-5 rounded" />}
                    <Skeleton className="h-5 w-32 rounded" />
                </div>
                {showSubtitle && <Skeleton className="h-4 w-48 rounded mt-1" />}
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-20 rounded" />
            </CardContent>
        </Card>
    );
}

export function DashboardChartSkeleton({ height = "h-[300px]" }: { height?: string }) {
    return (
        <Card className={`bg-white border-zinc-200 ${height}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-32 rounded" />
                </div>
                <Skeleton className="h-4 w-48 rounded mt-1" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                </div>
            </CardContent>
        </Card>
    );
}

export function DashboardRankingSkeleton({ height = "h-[300px]" }: { height?: string }) {
    return (
        <Card className={`bg-white border-zinc-200 ${height}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-32 rounded" />
                </div>
                <Skeleton className="h-4 w-48 rounded mt-1" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-6 h-6 rounded-full" />
                                <Skeleton className="h-4 w-24 rounded" />
                            </div>
                            <Skeleton className="h-6 w-8 rounded" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 