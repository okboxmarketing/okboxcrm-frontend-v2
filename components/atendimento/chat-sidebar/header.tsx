import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KanbanStep } from "@/lib/types";

interface HeaderProps {
    showMyTickets: boolean;
    setShowMyTickets: (value: boolean) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedKanbanStep: string;
    handleFilterTickets: (value: string) => void;
    kanbanSteps: KanbanStep[];
    userRole?: string;
    tab: string;
}

export const ChatSidebarHeader: React.FC<HeaderProps> = ({
    showMyTickets,
    setShowMyTickets,
    searchTerm,
    setSearchTerm,
    selectedKanbanStep,
    handleFilterTickets,
    kanbanSteps,
    userRole,
    tab
}) => {
    return (
        <div className="flex flex-col">
            <div className="p-4 border-b flex items-center">
                <h1 className="text-xl font-semibold">Atendimento</h1>
                {(userRole != "ADVISOR" && tab != "PENDING") && (
                    <div className="ml-auto flex items-center gap-2">
                        <Switch
                            id="myTicketsSwitch"
                            checked={showMyTickets}
                            onCheckedChange={(checked: boolean) => setShowMyTickets(checked)}
                        />
                        <label htmlFor="myTicketsSwitch" className="text-sm">
                            Meus Tickets
                        </label>
                    </div>
                )}
            </div>
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                        className="pl-9 bg-gray-50"
                        placeholder="Pesquisar ticket..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {tab === "OPEN" && (
                    <div className="pt-4">
                        <Select onValueChange={handleFilterTickets} value={selectedKanbanStep}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Filtrar por Etapa" className="w-1/2" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Etapas</SelectItem>
                                <SelectItem value="active">Apenas Leads Ativos</SelectItem>
                                {kanbanSteps
                                    .filter(step => step.id != null && step.name !== "Sem Contato")
                                    .map(step => {
                                        if (step.id == null) return null;
                                        return (
                                            <SelectItem key={step.id} value={step.id.toString()}>
                                                <p className="font-bold" style={{ color: step.color }}>
                                                    {step.name}
                                                </p>
                                            </SelectItem>
                                        );
                                    })}

                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </div>
    );
}; 