'use client'

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Mail, Calendar, XCircle } from "lucide-react";
import { deleteInvite, getPendingInvites } from "@/service/userService";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Invite } from "@/types/invites";


export interface PendingInvitesRef {
    refreshInvites: () => Promise<void>;
}

interface PendingInvitesProps {
    companyId?: string;
}

const PendingInvitesAccordion = forwardRef<PendingInvitesRef, PendingInvitesProps>(({ companyId }, ref) => {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteToDelete, setInviteToDelete] = useState<Invite | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const { toast } = useToast();

    const fetchInvites = async () => {
        try {
            const response = await getPendingInvites(companyId);
            setInvites(response);
        } catch {
            setInvites([]);
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        refreshInvites: fetchInvites
    }));

    useEffect(() => {
        fetchInvites();
    }, [companyId]);

    function isExpired(date: string) {
        return new Date(date) < new Date();
    }

    const handleDeleteInvite = async (invite: Invite) => {
        setInviteToDelete(invite);
        setLoadingDelete(true);
        try {
            await deleteInvite(invite.id, companyId);
            setInviteToDelete(null);
            setLoadingDelete(false);
            toast({ description: "Convite deletado com sucesso!" });
            // Atualiza a lista após deletar
            await fetchInvites();
        } catch (error) {
            toast({ variant: "destructive", description: String(error) });
        } finally {
            setInviteToDelete(null);
            setLoadingDelete(false);
        }
    };

    function getRoleVariant(role: string) {
        switch (role) {
            case "ADMIN":
                return "destructive";
            case "USER":
                return "secondary";
            default:
                return "outline";
        }
    }

    if (loading || invites.length === 0) {
        return null;
    }

    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="pending-invites">
                <AccordionTrigger className="px-0 py-2 text-lg font-medium">
                    Convites Pendentes ({invites.length})
                </AccordionTrigger>
                <AccordionContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead>Expira em</TableHead>
                                <TableHead className="w-[140px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invites.map((invite) => {
                                const expired = isExpired(invite.expiresAt);
                                return (
                                    <TableRow key={invite.id} className={expired ? "opacity-60" : ""}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`/placeholder.svg`} />
                                                    <AvatarFallback>
                                                        {invite.name
                                                            .split(" ")
                                                            .map(w => w[0])
                                                            .join("")
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{invite.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-1">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            {invite.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleVariant(invite.role)}>
                                                {invite.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(invite.createdAt), "dd/MM/yyyy HH:mm")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`flex items-center gap-1 text-sm ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(invite.expiresAt), "dd/MM/yyyy HH:mm")}
                                            </div>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            {!expired ? (
                                                <>
                                                    <Button size="sm" variant="outline" className="text-destructive" isLoading={loadingDelete && inviteToDelete?.id === invite.id} onClick={() => handleDeleteInvite(invite)}>
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="outline" disabled>
                                                    Expirado
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
});

PendingInvitesAccordion.displayName = "PendingInvitesAccordion";

export default PendingInvitesAccordion;
