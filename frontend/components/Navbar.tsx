"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { User as AppUser } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Command,
  LogOut,
  Moon,
  Search,
  SunMedium,
  User as UserIcon,
} from "lucide-react";

import { NAV_ITEMS } from "@/components/navigation/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSelectedNuevoUsuario } from "@/contexts/SelectedNuevoUsuarioContext";

export interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  user?: AppUser | null;
  onLogout?: () => void;
}

const navMap = new Map(NAV_ITEMS.map((item) => [item.href, item]));

function formatLabel(segment: string) {
  const decoded = decodeURIComponent(segment.replace(/-/g, " "));
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

export default function Navbar({ onToggleSidebar, isSidebarOpen, user, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedNuevoUsuario } = useSelectedNuevoUsuario();

  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    setIsDark(next);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const selectedNuevoUsuarioName = useMemo(() => {
    const raw = selectedNuevoUsuario?.nombreCompleto?.trim();
    return raw ? raw.toUpperCase() : null;
  }, [selectedNuevoUsuario?.nombreCompleto]);

  const breadcrumbs = useMemo(() => {
    if (segments.length === 0) {
      return [
        {
          href: "/dashboard",
          label: navMap.get("/dashboard")?.title ?? "Dashboard",
        },
      ];
    }

    const base = segments.map((_, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const match = navMap.get(href);
      return {
        href,
        label: match?.title ?? formatLabel(segments[index]),
      };
    });

    // Si estamos en la vista de detalle de un nuevo usuario, agregar el nombre como breadcrumb adicional
    if (
      selectedNuevoUsuarioName &&
      pathname.startsWith("/dashboard/nuevos-usuarios/gestion/") &&
      base.length >= 3
    ) {
      const updated = [...base];
      
      // Agregar el nombre como un nuevo breadcrumb separado
      if (updated.length > 3) {
        updated.splice(3);
      }
      
      updated.push({
        href: pathname,
        label: selectedNuevoUsuarioName,
      });

      return updated;
    }

    return base;
  }, [segments, pathname, selectedNuevoUsuarioName]);

  const currentItem = useMemo(() => {
    for (const [href, item] of navMap.entries()) {
      if (pathname === href || pathname.startsWith(`${href}/`)) {
        return item;
      }
    }
    return undefined;
  }, [pathname]);

  const displayName = useMemo(() => {
    if (!user) return "Usuario";
    const parts = [user.nombre, user.apellido, user.establecimiento].filter(Boolean);
    const fullName = [user.nombre, user.apellido].filter(Boolean).join(" ").trim();
    return fullName || parts[0] || user.email || "Usuario";
  }, [user]);

  const displayRole = user?.rol ?? "—";

  const filteredItems = useMemo(() => {
    if (!query) return NAV_ITEMS;
    const normalized = query.toLowerCase();
    return NAV_ITEMS.filter((item) =>
      `${item.section} ${item.title}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  const handleSelect = useCallback(
    (href: string) => {
      setIsCommandOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const ActiveIcon = currentItem?.icon ?? NAV_ITEMS[0].icon;

  return (
    <nav className="fixed z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="relative flex h-16 items-center justify-between px-4">
        <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Colapsar menú" : "Expandir menú"}
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </motion.div>
          </Button>

          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <motion.div
              key={currentItem?.id ?? "default"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"
            >
              <ActiveIcon className="h-5 w-5" />
            </motion.div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sistema Percápita
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AnimatePresence initial={false}>
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <motion.div
                        key={crumb.href}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2"
                      >
                        {index > 0 && <ChevronRight className="h-3 w-3" />}
                        {isLast ? (
                          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground">
                            {crumb.label}
                          </span>
                        ) : (
                          <Link className="hover:text-foreground" href={crumb.href}>
                            {crumb.label}
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden md:inline-flex gap-2 rounded-xl border border-border/60 bg-background/60 px-3"
            onClick={() => setIsCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">Buscar (Ctrl + K)</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            <motion.div
              key={String(isDark)}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.div>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2">
                <div className="flex items-center gap-3">
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-medium leading-4">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayRole}</p>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-primary/70 to-primary/30">
                    <UserIcon className="h-5 w-5" />
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/configuracion">Cambiar clave</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  onLogout?.();
                }}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="max-w-lg gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Command className="h-4 w-4" />
              Ir a…
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busca secciones, páginas o acciones"
                className="pl-9"
                autoFocus
              />
            </div>
            <ScrollArea className="max-h-80 rounded-lg border border-border/60 bg-muted/40">
              <div className="divide-y divide-border/60">
                {filteredItems.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No encontramos resultados. Intenta con otro término.
                  </p>
                ) : (
                  filteredItems.map((item) => {
                    const ActiveIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-background"
                        onClick={() => handleSelect(item.href)}
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-background">
                          <ActiveIcon className="h-5 w-5 text-primary" />
                        </span>
                        <span className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          )}
                        </span>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {item.section}
                        </Badge>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
