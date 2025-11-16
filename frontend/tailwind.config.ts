/**
 * Configuración de Tailwind CSS
 *
 * Este archivo define la configuración personalizada de Tailwind CSS para el sistema
 * Per Cápita FONASA, incluyendo tema, colores, animaciones y plugins.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // Modo oscuro basado en clases
  darkMode: ["class"],

  // Rutas de archivos a escanear para clases de Tailwind
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  // Prefijo para clases de Tailwind (opcional)
  prefix: "",

  theme: {
    // Configuración de contenedor
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      // Colores personalizados del sistema
      colors: {
        // Colores base
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Colores primarios
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // Colores secundarios
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        // Colores destructivos (errores, eliminación)
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // Colores mutados (texto secundario, deshabilitado)
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        // Colores de acentuación
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // Colores de popover
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Colores de tarjetas
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Colores específicos del sistema Per Cápita
        "percapita": {
          "validado": "#10b981",      // Verde - Usuario validado
          "no-validado": "#ef4444",   // Rojo - Usuario no validado
          "pendiente": "#f59e0b",     // Amarillo - Usuario pendiente
          "fallecido": "#6b7280",     // Gris - Usuario fallecido
          "inscripcion": "#3b82f6",   // Azul - Nueva inscripción
          "ausente": "#d1d5db",       // Gris claro - Ausente en corte
        },

        // Colores de estado adicionales
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#3b82f6",
      },

      // Radio de bordes personalizado
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Animaciones personalizadas
      keyframes: {
        // Animación de entrada desde arriba
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        // Animación de salida hacia arriba
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Shimmer para skeletons y loading states
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        // Fade in
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Fade out
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        // Slide in desde la derecha
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        // Slide out hacia la derecha
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        // Pulse suave
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".7" },
        },
        // Bounce suave
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

      // Definición de animaciones
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-out": "fade-out 0.3s ease-in-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-in",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "bounce-soft": "bounce-soft 1s ease-in-out infinite",
      },

      // Espaciado personalizado
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // Tamaños de fuente personalizados
      fontSize: {
        "2xs": "0.625rem",
      },

      // Z-index personalizado
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },

      // Box shadow personalizado
      boxShadow: {
        "percapita": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "percapita-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },

  // Plugins de Tailwind
  plugins: [
    require("tailwindcss-animate"),
    // Plugin personalizado para utilidades adicionales
    function({ addUtilities }: any) {
      const newUtilities = {
        // Ocultar scrollbar pero mantener funcionalidad
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        // Scrollbar personalizado
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "hsl(var(--muted))",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "hsl(var(--primary))",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "hsl(var(--primary) / 0.8)",
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
