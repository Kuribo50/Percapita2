"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Users,
  CheckCircle,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CarouselItem {
  id: number;
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  iconBg: string;
}

interface InfoCarouselProps {
  estadisticas?: {
    totalUsuarios?: number;
    validados?: number;
    pendientes?: number;
    ultimaCarga?: string;
    totalCargas?: number;
    promedioExito?: number;
    validadosPorCentro?: Record<string, number>;
  };
}

export function InfoCarousel({ estadisticas }: InfoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Construir items dinámicamente
  const items: CarouselItem[] = [
    {
      id: 1,
      title: 'Total de Usuarios',
      value: estadisticas?.totalUsuarios?.toLocaleString('es-CL') || '0',
      description: 'Usuarios registrados en el sistema',
      icon: <Users className="w-7 h-7" />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      iconBg: 'bg-blue-100',
    },
  ];

  // Agregar items de centros validados dinámicamente
  let itemId = 2;
  const colorSchemes = [
    { color: 'text-emerald-700', bgColor: 'bg-emerald-50 hover:bg-emerald-100', iconBg: 'bg-emerald-100' },
    { color: 'text-teal-700', bgColor: 'bg-teal-50 hover:bg-teal-100', iconBg: 'bg-teal-100' },
    { color: 'text-green-700', bgColor: 'bg-green-50 hover:bg-green-100', iconBg: 'bg-green-100' },
    { color: 'text-cyan-700', bgColor: 'bg-cyan-50 hover:bg-cyan-100', iconBg: 'bg-cyan-100' },
  ];
  
  if (estadisticas?.validadosPorCentro) {
    Object.entries(estadisticas.validadosPorCentro).forEach(([centro, cantidad], index) => {
      const scheme = colorSchemes[index % colorSchemes.length];
      items.push({
        id: itemId++,
        title: `Validados ${centro}`,
        value: cantidad.toLocaleString('es-CL'),
        description: `Usuarios validados en ${centro}`,
        icon: <CheckCircle className="w-7 h-7" />,
        ...scheme,
      });
    });
  }

  // Agregar items estáticos restantes (sin "Usuarios Validados")
  items.push(
    {
      id: itemId++,
      title: 'Total de Cortes',
      value: estadisticas?.totalCargas?.toLocaleString('es-CL') || '0',
      description: 'Archivos procesados exitosamente',
      icon: <FileText className="w-7 h-7" />,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      iconBg: 'bg-purple-100',
    },
    {
      id: itemId++,
      title: 'Tasa de Éxito',
      value: `${estadisticas?.promedioExito || 0}%`,
      description: 'Promedio de éxito en cargas',
      icon: <TrendingUp className="w-7 h-7" />,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      iconBg: 'bg-indigo-100',
    },
    {
      id: itemId++,
      title: 'Última Actualización',
      value: estadisticas?.ultimaCarga || 'N/A',
      description: 'Fecha de la última carga',
      icon: <Calendar className="w-7 h-7" />,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50 hover:bg-slate-100',
      iconBg: 'bg-slate-100',
    }
  );

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const goToNext = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const currentItem = items[currentIndex];

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className={cn(
          "relative transition-colors duration-500 ease-in-out",
          currentItem.bgColor
        )}>
          {/* Contenido del Carrusel */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Contenido Principal */}
              <div className="flex items-start gap-4 sm:gap-6 flex-1">
                <div className={cn(
                  "p-3 sm:p-4 rounded-xl transition-colors duration-500",
                  currentItem.iconBg
                )}>
                  <div className={cn("transition-colors duration-500", currentItem.color)}>
                    {currentItem.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={cn(
                      "text-sm font-semibold uppercase tracking-wide transition-colors duration-500",
                      currentItem.color
                    )}>
                      {currentItem.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {currentIndex + 1}/{items.length}
                    </Badge>
                  </div>
                  
                  <p className="text-4xl sm:text-5xl font-bold text-foreground mb-2 transition-all duration-500">
                    {currentItem.value}
                  </p>
                  
                  <p className="text-sm text-muted-foreground">
                    {currentItem.description}
                  </p>
                </div>
              </div>

              {/* Controles de Navegación */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAutoPlay}
                  className="h-9 w-9 rounded-lg"
                  title={isAutoPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isAutoPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrev}
                    className="h-9 w-9 rounded-lg"
                    title="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNext}
                    className="h-9 w-9 rounded-lg"
                    title="Siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Indicadores de Progreso */}
            <div className="flex justify-center gap-1.5 mt-6 pt-6 border-t">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-1.5 bg-muted hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Ir a slide ${index + 1}`}
                  title={items[index].title}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}