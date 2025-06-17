"use client"

import type React from "react"
import {
    X,
    Phone,
    UserCheck,
    MapPin,
    Tag,
    CalendarIcon as CalendarArrowUp,
    CalendarCheck,
    ShoppingCart,
    AlertTriangle,
    NotepadTextDashed,
    Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useChatStore } from "@/store/chatStore"
import { UserAvatar } from "@/components/ui/user-avatar"
import { formatPhone } from "@/lib/utils"
import { formatDate } from "date-fns"
import { useEffect, useState } from "react"
import { getSalesByTicketId } from "@/service/saleService"
import { getLossesByTicketId } from "@/service/lossService"
import type { Sale, Loss } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"
import { addObservation } from "@/service/ticketsService"
import { useToast } from "@/hooks/use-toast"

interface InfoSidebarProps {
    isOpen: boolean
    onClose: () => void
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({ isOpen, onClose }) => {
    const { selectedChat } = useChatStore()
    const [sales, setSales] = useState<Sale[]>([])
    const [losses, setLosses] = useState<Loss[]>([])
    const [observation, setObservation] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const { toast } = useToast()

    useEffect(() => {
        const fetchSalesAndLosses = async () => {
            if (selectedChat?.id) {
                try {
                    const salesData = await getSalesByTicketId(selectedChat.id)
                    setSales(salesData)
                    const lossesData = await getLossesByTicketId(selectedChat.id)
                    setLosses(lossesData)
                } catch (error) {
                    console.error("Erro ao buscar dados:", error)
                }
            }
        }

        fetchSalesAndLosses()
        if (selectedChat?.observation) {
            setObservation(selectedChat.observation)
        } else {
            setObservation("")
        }
    }, [selectedChat?.id, selectedChat?.observation])

    const handleAddObservation = async () => {
        if (selectedChat?.id) {
            try {
                setIsLoading(true)
                await addObservation(selectedChat.id, observation)
                setEditMode(false)
                selectedChat.observation = observation
                toast({
                    title: "Observação adicionada com sucesso",
                })
            } catch (error) {
                console.error("Erro ao adicionar observação:", error)
                toast({
                    title: "Erro ao adicionar observação",
                    description: "Erro ao adicionar observação",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }
    }

    if (!selectedChat) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const InfoItem = ({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                <div className="text-sm text-foreground">{children}</div>
            </div>
        </div>
    )

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-96 lg:w-80 xl:w-96 bg-background border-l shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b bg-muted/30">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Informações do Lead</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {/* Contact Info */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <UserAvatar
                                name={selectedChat.Contact.name}
                                pictureUrl={selectedChat.Contact.pictureUrl}
                                className="w-12 h-12 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold truncate">{selectedChat.Contact.name}</h3>
                                <p className="text-sm text-muted-foreground">Lead Ativo</p>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-1">
                            <InfoItem icon={Phone} label="Telefone">
                                <span className="font-medium">{formatPhone(selectedChat.Contact.phone)}</span>
                            </InfoItem>

                            <InfoItem icon={Tag} label="Etapa">
                                <Badge style={{ backgroundColor: selectedChat.KanbanStep.color }} className="text-white">
                                    {selectedChat.KanbanStep.name}
                                </Badge>
                            </InfoItem>

                            {selectedChat.responsibleId && (
                                <InfoItem icon={UserCheck} label="Responsável">
                                    <span className="font-medium">{selectedChat.Responsible?.name}</span>
                                </InfoItem>
                            )}

                            <InfoItem icon={MapPin} label="Origem">
                                <span className="font-medium">{selectedChat.Contact.origin || "Não informado"}</span>
                            </InfoItem>

                            <InfoItem icon={CalendarArrowUp} label="Data de Criação">
                                <span className="font-medium">{formatDate(new Date(selectedChat.createdAt), "dd/MM/yyyy HH:mm")}</span>
                            </InfoItem>

                            <InfoItem icon={CalendarCheck} label="Aceito em">
                                <span className="font-medium">{formatDate(new Date(selectedChat.acceptedAt), "dd/MM/yyyy HH:mm")}</span>
                            </InfoItem>

                            <InfoItem icon={NotepadTextDashed} label="Observação">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{selectedChat.observation || "Não informado"}</span>
                                    <Button variant="ghost" size="icon" onClick={() => setEditMode(!editMode)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            </InfoItem>
                            {editMode && (
                                <div className="flex flex-col gap-2">
                                    <Textarea
                                        placeholder="Observação"
                                        value={observation}
                                        onChange={(e) => setObservation(e.target.value)}
                                    />
                                    <Button onClick={handleAddObservation} isLoading={isLoading}>Adicionar Observação</Button>
                                </div>
                            )}
                        </div>




                        <Separator />

                        {/* Sales Section */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Vendas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {sales.length > 0 ? (
                                    <div className="space-y-3">
                                        {sales.map((sale) => (
                                            <div key={sale.id} className="border rounded-lg p-3 bg-muted/20">
                                                <div className="text-xs text-muted-foreground mb-2 flex flex-row justify-between">
                                                    <p>Venda</p>
                                                    <p>{formatCurrency(sale.totalAmount)}</p>
                                                </div>
                                                {sale.SaleItems && sale.SaleItems.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="text-xs h-8">Produto</TableHead>
                                                                <TableHead className="text-xs h-8 text-center">Qtd</TableHead>
                                                                <TableHead className="text-xs h-8 text-right">Valor</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {sale.SaleItems.map((item) => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell className="text-xs py-2 font-medium">{item.Product.name}</TableCell>
                                                                    <TableCell className="text-xs py-2 text-center">{item.quantity}x</TableCell>
                                                                    <TableCell className="text-xs py-2 text-right">
                                                                        {formatCurrency(item.unitPrice)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Sem itens</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Losses Section */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Perdas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {losses.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs h-8">Motivo</TableHead>
                                                <TableHead className="text-xs h-8 text-right">Data</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {losses.map((loss) => (
                                                <TableRow key={loss.id}>
                                                    <TableCell className="text-xs py-2 font-medium">
                                                        {loss.LossReason?.description || "Não informado"}
                                                    </TableCell>
                                                    <TableCell className="text-xs py-2 text-right text-muted-foreground">
                                                        {formatDate(new Date(loss.createdAt), "dd/MM/yyyy")}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma perda registrada</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </div>
        </>
    )
}

export default InfoSidebar
