"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

interface DynamicGreetingProps {
  userName: string;
}

export function DynamicGreeting({ userName }: DynamicGreetingProps) {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState<React.ReactNode>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [gradient, setGradient] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      // Hora de Chile (UTC-3 o UTC-4 dependiendo del horario de verano)
      const now = new Date();
      const chileTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
      const hour = chileTime.getHours();

      // Formatear hora actual
      const timeString = chileTime.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setCurrentTime(timeString);

      // Determinar saludo y estilo según la hora
      if (hour >= 5 && hour < 12) {
        setGreeting('Buenos días');
        setIcon(<Sunrise className="w-8 h-8 text-amber-500" />);
        setGradient('from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30');
      } else if (hour >= 12 && hour < 19) {
        setGreeting('Buenas tardes');
        setIcon(<Sun className="w-8 h-8 text-orange-500" />);
        setGradient('from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30');
      } else if (hour >= 19 && hour < 22) {
        setGreeting('Buenas tardes');
        setIcon(<Sunset className="w-8 h-8 text-purple-500" />);
        setGradient('from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30');
      } else {
        setGreeting('Buenas noches');
        setIcon(<Moon className="w-8 h-8 text-indigo-500" />);
        setGradient('from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-purple-950/30');
      }
    };

    updateGreeting();
    // Actualizar cada minuto
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`rounded-2xl p-6 bg-gradient-to-r ${gradient} border-2 border-gray-200/50 dark:border-gray-700/50 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-md">
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {greeting}, {userName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Bienvenido de vuelta al sistema de gestión • {currentTime} hrs
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-md">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Hora actual
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-mono">
              {currentTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
