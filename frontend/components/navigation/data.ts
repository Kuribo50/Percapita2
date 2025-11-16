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
  XCircle,
  CheckCircle,
  UserSearch,
} from "lucide-react";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavigationEntry {
  id: string;
  title: string;
  href: string;
  icon: IconType;
  description?: string;
  badge?: string;
  iconColor?: string;
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
        iconColor: "text-blue-500",
      },
    ],
  },
  {
    id: "revision-de-usuarios",
    title: "Revisión de Usuarios",
    items: [
      {
        id: "nuevos-usuarios",
        title: "Usuarios nuevos",
        href: "/dashboard/revision-de-usuarios/nuevos-usuarios/gestion",
        icon: UserPlus,
        description: "Registrar, validar y revisar solicitudes de inscripción",
        iconColor: "text-purple-500",
      },
      {
        id: "usuarios-no-validados",
        title: "Usuarios no validados",
        href: "/dashboard/revision-de-usuarios/usuarios-no-validados/gestion",
        icon: XCircle,
        description: "Revisión de usuarios rechazados, fallecidos y traslados",
        iconColor: "text-red-500",
      },
      {
        id: "usuarios-inscritos-validados",
        title: "Usuarios inscritos validados",
        href: "/dashboard/revision-de-usuarios/usuarios-inscritos-validados/gestion",
        icon: CheckCircle,
        description: "Gestión de usuarios con estado aceptado",
        iconColor: "text-green-500",
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
        iconColor: "text-orange-500",
      },
      {
        id: "subir-corte-gestion",
        title: "Gestión de cargas",
        href: "/dashboard/subir-corte/gestion",
        icon: Layers,
        description: "Historial y seguimiento de archivos cargados",
        iconColor: "text-amber-500",
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
        iconColor: "text-indigo-500",
      },
      {
        id: "bases-trakcare",
        title: "HP Trakcare",
        href: "/dashboard/bases/trakcare",
        icon: ServerCog,
        description: "Consulta y cruza registros de Trakcare",
        iconColor: "text-cyan-500",
      },
      {
        id: "buscar-usuario",
        title: "Buscar usuario",
        href: "/dashboard/buscar-usuario",
        icon: UserSearch,
        description: "Buscar usuario por RUT con historial completo",
        iconColor: "text-emerald-500",
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
        iconColor: "text-teal-500",
      },
      {
        id: "renovacion-nip",
        title: "Renovación NIP",
        href: "/dashboard/renovacion-nip",
        icon: RefreshCw,
        description: "Seguimiento del proceso de renovación NIP",
        iconColor: "text-yellow-500",
      },
      {
        id: "revision-diaria",
        title: "Revisión diaria",
        href: "/dashboard/revision-diaria",
        icon: Calendar,
        description: "Control diario de pendientes",
        iconColor: "text-pink-500",
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
        iconColor: "text-sky-500",
      },
      {
        id: "cert-renuncia",
        title: "Certificado de renuncia",
        href: "/dashboard/certificado-renuncia",
        icon: FileText,
        description: "Genera certificados de renuncia",
        iconColor: "text-rose-500",
      },
      {
        id: "cert-residencia",
        title: "Certificado de residencia",
        href: "/dashboard/certificado-residencia",
        icon: FileText,
        description: "Genera certificados de residencia",
        iconColor: "text-violet-500",
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
        iconColor: "text-slate-500",
      },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    section: section.title,
  }))
);

type NavItemWithSection = (typeof NAV_ITEMS)[number];

export type { NavItemWithSection };
