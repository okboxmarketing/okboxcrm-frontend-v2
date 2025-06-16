"use client"

import type React from "react"
import { X, Phone, User, UserCheck, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useChatStore } from "@/store/chatStore"
import { UserAvatar } from "@/components/ui/user-avatar"
import { formatPhone } from "@/lib/utils"

interface InfoSidebarProps {
    isOpen: boolean
    onClose: () => void
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({ isOpen, onClose }) => {
    const { selectedChat } = useChatStore()

    if (!selectedChat) return null

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "ativo":
            case "active":
                return "bg-green-50 text-green-700 border-green-200"
            case "pendente":
            case "pending":
                return "bg-yellow-50 text-yellow-700 border-yellow-200"
            case "inativo":
            case "inactive":
                return "bg-red-50 text-red-700 border-red-200"
            default:
                return "bg-gray-50 text-gray-700 border-gray-200"
        }
    }

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
                className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Informações do Lead</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto">
                    {/* Profile Section */}
                    <div className="flex items-center gap-3 pb-4 border-b">
                        <UserAvatar
                            name={selectedChat.Contact.name}
                            pictureUrl={selectedChat.Contact.pictureUrl}
                            className="w-12 h-12"
                        />
                        <div>
                            <h3 className="font-semibold text-gray-900">{selectedChat.Contact.name}</h3>
                            <p className="text-sm text-gray-500">Lead Ativo</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Telefone</p>
                                <p className="text-sm font-medium text-gray-900">{formatPhone(selectedChat.Contact.phone)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(selectedChat.status)}`}>
                                    {selectedChat.status}
                                </Badge>
                            </div>
                        </div>

                        {selectedChat.responsibleId && (
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Responsável</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedChat.Responsible?.name}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Origem</p>
                                <p className="text-sm font-medium text-gray-900">{selectedChat.Contact.origin || "Não informado"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InfoSidebar
