"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { NAV_SECTIONS } from "@/components/navigation/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight } from "lucide-react";

export interface SidebarProps {
  isOpen: boolean;
}

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

interface SidebarLinkProps {
  href: string;
  title: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  active: boolean;
  revealText: boolean;
  iconColor?: string;
  description?: string;
}

function SidebarLink({
  href,
  title,
  Icon,
  badge,
  active,
  revealText,
  iconColor,
  description,
}: SidebarLinkProps) {
  const content = (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        revealText ? "justify-start" : "justify-center",
        active
          ? "text-white shadow-sm"
          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
      )}
      aria-current={active ? "page" : undefined}
    >
      {/* Indicador activo con gradiente */}
      {active && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Icono */}
      <div
        className={cn(
          "relative z-10 flex-shrink-0",
          active ? "text-white" : iconColor
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Contenido texto */}
      <AnimatePresence>
        {revealText && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex w-full items-center justify-between gap-2 min-w-0"
          >
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{title}</div>
              {description && !active && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {description}
                </div>
              )}
            </div>
            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] flex-shrink-0",
                  active
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                )}
              >
                {badge}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de hover cuando está colapsado */}
      {!revealText && !active && (
        <ChevronRight className="absolute -right-1 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </Link>
  );

  if (revealText || active) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent
        side="right"
        className="flex flex-col gap-1 max-w-xs"
      >
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  const activeIds = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (isActivePath(pathname, item.href)) {
          map.set(item.id, true);
        }
      }
    }
    return map;
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={80}>
      <aside
        className={cn(
          "fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300",
          isOpen ? "w-72" : "w-16"
        )}
        aria-label="Barra lateral de navegación"
      >
        {/* Gradiente decorativo superior */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 pointer-events-none" />

        <ScrollArea className="h-full px-3 py-6 relative">
          <nav
            className="flex flex-col gap-6"
            aria-label="Secciones de navegación"
          >
            {NAV_SECTIONS.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: sectionIndex * 0.05,
                }}
                className="space-y-2"
              >
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500 flex items-center gap-2"
                    >
                      <span>{section.title}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-1">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: (sectionIndex * 0.05) + (itemIndex * 0.03),
                      }}
                    >
                      <SidebarLink
                        href={item.href}
                        title={item.title}
                        Icon={item.icon}
                        badge={item.badge}
                        description={item.description}
                        active={Boolean(activeIds.get(item.id))}
                        revealText={isOpen}
                        iconColor={item.iconColor}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </nav>
        </ScrollArea>

        {/* Indicador de versión (solo cuando está expandido) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent dark:from-gray-950 pointer-events-none"
            >
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-600">
                  Sistema Per Cápita v2.0
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </TooltipProvider>
  );
}
