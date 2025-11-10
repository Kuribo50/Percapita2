import type { ComponentType, SVGProps } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Upload,
  Layers,
  Database,
  ServerCog,
  Users,
  RefreshCw,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavigationEntry {
  id: string;
  title: string;
  href: string;
  icon: IconType;
  description?: string;
  badge?: string;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationEntry[];
}

export const NAV_SECTIONS: NavigationSection[] = [
  {
    id: "overview",
    title: "Resumen",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Indicadores generales y métricas principales",
      },
    ],
  },
  {
    id: "nuevos-usuarios",
    title: "Nuevos Usuarios",
    items: [
      {
        id: "nuevos-gestion",
        title: "Gestión diaria",
        href: "/dashboard/nuevos-usuarios/gestion",
        icon: UserPlus,
        description: "Registrar, validar y revisar solicitudes de inscripción",
      },
    ],
  },
  {
    id: "cargas",
    title: "Cargas & Corte",
    items: [
      {
        id: "subir-corte",
        title: "Subir corte",
        href: "/dashboard/subir-corte",
        icon: Upload,
        description: "Asistente para importar el corte FONASA",
      },
      {
        id: "subir-corte-gestion",
        title: "Gestión de cargas",
        href: "/dashboard/subir-corte/gestion",
        icon: Layers,
        description: "Historial y seguimiento de archivos cargados",
      },
    ],
  },
  {
    id: "bases",
    title: "Bases de Datos",
    items: [
      {
        id: "bases-panel",
        title: "Panel de bases",
        href: "/dashboard/bases",
        icon: Database,
        description: "Explora las bases FONASA y HP Trakcare",
      },
      {
        id: "bases-trakcare",
        title: "HP Trakcare",
        href: "/dashboard/bases/trakcare",
        icon: ServerCog,
        description: "Consulta y cruza registros de Trakcare",
      },
    ],
  },
  {
    id: "revision-control",
    title: "Revisión & Control",
    items: [
      {
        id: "revision-usuarios",
        title: "Usuarios inscritos",
        href: "/dashboard/revision-usuarios",
        icon: Users,
        description: "Revisión de usuarios ya inscritos",
      },
      {
        id: "renovacion-nip",
        title: "Renovación NIP",
        href: "/dashboard/renovacion-nip",
        icon: RefreshCw,
        description: "Seguimiento del proceso de renovación NIP",
      },
      {
        id: "revision-diaria",
        title: "Revisión diaria",
        href: "/dashboard/revision-diaria",
        icon: Calendar,
        description: "Control diario de pendientes",
      },
    ],
  },
  {
    id: "certificados",
    title: "Certificados",
    items: [
      {
        id: "cert-inscripcion",
        title: "Certificado de inscripción",
        href: "/dashboard/certificado-inscripcion",
        icon: FileText,
        description: "Genera certificados de inscripción",
      },
      {
        id: "cert-renuncia",
        title: "Certificado de renuncia",
        href: "/dashboard/certificado-renuncia",
        icon: FileText,
        description: "Genera certificados de renuncia",
      },
      {
        id: "cert-residencia",
        title: "Certificado de residencia",
        href: "/dashboard/certificado-residencia",
        icon: FileText,
        description: "Genera certificados de residencia",
      },
    ],
  },
  {
    id: "configuracion",
    title: "Configuración",
    items: [
      {
        id: "ajustes",
        title: "Preferencias del sistema",
        href: "/dashboard/configuracion",
        icon: Settings,
        description: "Ajustes avanzados y catálogos",
      },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    section: section.title,
  })),
);

type NavItemWithSection = (typeof NAV_ITEMS)[number];

export type { NavItemWithSection };
