"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface ModernWelcomeSectionProps {
  userName?: string;
}

export function ModernWelcomeSection({
  userName = 'Usuario',
}: ModernWelcomeSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const currentDate = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-2 bg-gradient-to-r from-primary/5 via-primary/3 to-background">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {getGreeting()}, {userName}
                </h1>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
                  En línea
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {currentDate}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="w-4 h-4" />
              Historial
            </Button>
            <Button size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Ver Reportes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
