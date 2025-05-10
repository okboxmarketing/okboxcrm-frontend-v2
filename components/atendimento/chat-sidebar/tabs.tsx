import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TicketStatusEnum } from "@/lib/types";

interface TabsProps {
    tab: string;
    setTab: (value: TicketStatusEnum) => void;
    ticketCounts: {
        unread: number;
        pending: number;
    };
}

export const ChatSidebarTabs: React.FC<TabsProps> = ({
    tab,
    setTab,
    ticketCounts
}) => {
    return (
        <Tabs value={tab} onValueChange={(value) => setTab(value as TicketStatusEnum)}>
            <TabsList className="grid grid-cols-2">
                <TabsTrigger value="OPEN" className="gap-2">
                    ATENDENDO
                    {ticketCounts.unread > 0 && (
                        <Badge variant={"destructive"}>{ticketCounts.unread}</Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="gap-2">
                    AGUARDANDO
                    {ticketCounts.pending > 0 && (
                        <Badge variant={"destructive"}>{ticketCounts.pending}</Badge>
                    )}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}; 