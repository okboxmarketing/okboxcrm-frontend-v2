'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiHelper } from '@/lib/apiHelper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanySettings {
    leadRouletteEnabled: boolean;
}

export default function Configuracao() {
    const [leadRouletteEnabled, setLeadRouletteEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await apiHelper.get<CompanySettings>('/company-settings');
            setLeadRouletteEnabled(response.leadRouletteEnabled);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro",
                description: "Erro ao carregar configurações",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLeadRouletteChange = async (checked: boolean) => {
        try {
            await apiHelper.patch('/company-settings', {
                leadRouletteEnabled: checked
            });
            setLeadRouletteEnabled(checked);
            toast({
                title: "Sucesso",
                description: "Configurações atualizadas com sucesso",
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
            toast({
                title: "Erro",
                description: "A roleta só pode ser ativada se houver pelo menos um usuário com role USER cadastrado.",
                variant: "destructive"
            });
            setLeadRouletteEnabled(!checked);
        }
    };

    if (loading) {
        return (
            <div className="container py-8">
                <Skeleton className="h-8 w-[200px] mb-4" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        );
    }

    return (
        <div className="container p-6">
            <h1 className="text-3xl font-bold mb-6">Configurações</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Roleta de Disparos de Leads</CardTitle>
                    <CardDescription>
                        Ative esta opção para habilitar a roleta de disparos automáticos de leads.
                        Quando ativada, o sistema distribuirá automaticamente os leads entre os vendedores
                        disponíveis, garantindo uma distribuição justa e eficiente das oportunidades.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="lead-roulette"
                            checked={leadRouletteEnabled}
                            onCheckedChange={handleLeadRouletteChange}
                        />
                        <Label htmlFor="lead-roulette">
                            {leadRouletteEnabled ? 'Ativado' : 'Desativado'}
                        </Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
