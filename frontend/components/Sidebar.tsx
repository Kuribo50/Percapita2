"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

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
}

function SidebarLink({
  href,
  title,
  Icon,
  badge,
  active,
  revealText,
  iconColor,
}: SidebarLinkProps) {
  const content = (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        revealText ? "justify-start" : "justify-center",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/20"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Icon className={cn("relative z-10 h-5 w-5", iconColor)} />
      {revealText && (
        <div className="relative z-10 flex w-full items-center justify-between gap-2">
          <span className="truncate">{title}</span>
          {badge && (
            <Badge variant="outline" className="text-[10px]">
              {badge}
            </Badge>
          )}
        </div>
      )}
    </Link>
  );

  if (revealText) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs font-medium">
        {title}
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
          "fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] border-r border-border/40 bg-background/80 backdrop-blur transition-[width] duration-300",
          isOpen ? "w-72" : "w-16"
        )}
        aria-label="Barra lateral de navegación"
      >
        <ScrollArea className="h-full px-3 py-6">
          <nav
            className="flex flex-col gap-6"
            aria-label="Secciones de navegación"
          >
            {NAV_SECTIONS.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.02 }}
                className="space-y-2"
              >
                {isOpen ? (
                  <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                    {section.title}
                  </div>
                ) : null}

                <div className="grid gap-1">
                  {section.items.map((item) => (
                    <SidebarLink
                      key={item.id}
                      href={item.href}
                      title={item.title}
                      Icon={item.icon}
                      badge={item.badge}
                      active={Boolean(activeIds.get(item.id))}
                      revealText={isOpen}
                      iconColor={item.iconColor}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}
