"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { busquedaGlobal } from "@/services/busqueda";
import type {
  BusquedaGlobalResponse,
  ResultadoBusqueda,
  IconoBusqueda,
} from "@/types";
import {
  Search,
  UserCog,
  UserPlus,
  FileText,
  Database,
  Building,
  Activity,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICONO_MAP: Record<IconoBusqueda, React.ComponentType<any>> = {
  "user-cog": UserCog,
  "user-plus": UserPlus,
  "file-text": FileText,
  database: Database,
  building: Building,
  activity: Activity,
};

const CATEGORIA_LABELS: Record<string, string> = {
  usuarios_sistema: "Usuarios del Sistema",
  nuevos_usuarios: "Nuevos Usuarios",
  cortes_fonasa: "Cortes FONASA",
  hp_trakcare: "HP Trakcare",
  establecimientos: "Establecimientos",
  logs: "Logs de Auditoría",
};

const CATEGORIA_COLORS: Record<string, string> = {
  usuarios_sistema: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  nuevos_usuarios: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  cortes_fonasa: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  hp_trakcare: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  establecimientos: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  logs: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: GlobalSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusquedaGlobalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await busquedaGlobal(query, 5);
        setResults(response);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Error en búsqueda:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset cuando se cierra
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
    }
  }, [open]);

  // Aplanar resultados para navegación con teclado
  const flatResults = results
    ? Object.entries(results.results).flatMap(([categoria, items]) =>
        items?.map((item) => ({ ...item, categoria })) || []
      )
    : [];

  const handleSelect = useCallback(
    (result: ResultadoBusqueda) => {
      onOpenChange(false);
      router.push(result.url);
    },
    [router, onOpenChange]
  );

  // Navegación con teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatResults.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
      }
    },
    [flatResults, selectedIndex, handleSelect]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Búsqueda Global
          </DialogTitle>
        </DialogHeader>

        {/* Input de búsqueda */}
        <div className="relative p-6 pb-4">
          <Search className="pointer-events-none absolute left-9 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar usuarios, cortes, establecimientos..."
            className="pl-11 pr-10 h-12 text-base"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-9 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Resultados */}
        <ScrollArea className="max-h-[500px] border-t">
          {query.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                Escribe al menos 2 caracteres para buscar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Busca por RUN, nombre, ficha, código o descripción
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Buscando...</p>
            </div>
          ) : !results || results.total_results === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium">No se encontraron resultados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Intenta con otro término de búsqueda
              </p>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="secondary">
                  {results.total_results} resultado
                  {results.total_results !== 1 ? "s" : ""}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  para "{results.query}"
                </span>
              </div>

              <div className="space-y-6">
                {Object.entries(results.results).map(
                  ([categoria, items]) =>
                    items &&
                    items.length > 0 && (
                      <div key={categoria}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2">
                          {CATEGORIA_LABELS[categoria] || categoria}
                        </h3>
                        <div className="space-y-1">
                          {items.map((item, index) => {
                            const globalIndex = flatResults.findIndex(
                              (r) => r.id === item.id && r.categoria === categoria
                            );
                            const isSelected = globalIndex === selectedIndex;
                            const IconComponent = ICONO_MAP[item.icono];

                            return (
                              <button
                                key={`${categoria}-${item.id}`}
                                onClick={() => handleSelect(item)}
                                className={cn(
                                  "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                                  isSelected
                                    ? "bg-accent"
                                    : "hover:bg-accent/50"
                                )}
                              >
                                {/* Icono */}
                                <div className="flex-shrink-0 mt-0.5">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <IconComponent className="h-5 w-5 text-primary" />
                                  </div>
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm leading-tight">
                                    {item.titulo}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {item.subtitulo}
                                  </p>
                                </div>

                                {/* Badge de categoría */}
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "flex-shrink-0 text-[10px]",
                                    CATEGORIA_COLORS[categoria]
                                  )}
                                >
                                  {CATEGORIA_LABELS[categoria]}
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer con hints */}
        <div className="border-t px-6 py-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded border">↑↓</kbd>
            <span>Navegar</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded border">Enter</kbd>
            <span>Abrir</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded border">Esc</kbd>
            <span>Cerrar</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
