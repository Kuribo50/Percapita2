"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DynamicGreeting } from "@/components/dashboard/DynamicGreeting";
import { InfoCarousel } from "@/components/dashboard/InfoCarousel";
import { AdvancedChartFilters } from "@/components/dashboard/AdvancedChartFilters";
import { ModernStatsSection } from "@/components/dashboard/ModernStatsSection";
import { ModernChartsSection } from "@/components/dashboard/ModernChartsSection";
import { NuevosUsuariosSection } from "@/components/dashboard/NuevosUsuariosSection";
import { HistorialCargasSection } from "@/components/dashboard/HistorialCargasSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BarChart3, FileUp, UserPlus, Eye } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CorteSummary {
  month: string;
  label: string;
  total: number;
  validated: number;
  nonValidated: number;
}

interface CentroDatos {
  centro: string;
  data: CorteSummary[];
}

interface CorteData {
  total: number;
  validated: number;
  non_validated: number;
  summary: CorteSummary[];
  by_centro?: CentroDatos[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [corteData, setCorteData] = useState<CorteData | null>(null);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState<number>(0);
  const [validatedByCenter, setValidatedByCenter] = useState<
    Record<string, number>
  >({});

  // Estados aplicados de filtros
  const [selectedMonthsRange, setSelectedMonthsRange] = useState<string>("3");
  const [selectedCentros, setSelectedCentros] = useState<string[]>([]);
  const [centrosDisponibles, setCentrosDisponibles] = useState<
    Array<{ nombre: string; visible: boolean }>
  >([]);

  // Función para formatear números
  const formatNumber = useCallback((value: number | string): string => {
    if (typeof value === "string") return value;
    return new Intl.NumberFormat("es-CL").format(value);
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch centros disponibles
      const centrosRes = await fetch(`${API_URL}/api/centros-disponibles/`);
      let centrosNombres: string[] = [];
      if (centrosRes.ok) {
        const data = await centrosRes.json();
        setCentrosDisponibles(data.centros || []);
        centrosNombres = (data.centros || []).map(
          (c: { nombre: string }) => c.nombre
        );
      }

      // Fetch corte summary - aplicar filtro de centros si está seleccionado
      const corteParams = new URLSearchParams({ summary_only: "true" });
      if (selectedCentros.length > 0) {
        corteParams.append("centros", selectedCentros.join(","));
      }
      const corteRes = await fetch(
        `${API_URL}/api/corte-fonasa/?${corteParams.toString()}`
      );
      if (corteRes.ok) {
        const data = await corteRes.json();
        setCorteData(data);
      } else {
        throw new Error("Error al cargar datos de corte");
      }

      // Obtener fecha del mes actual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

      // Fetch nuevos usuarios del mes actual
      const newUsersRes = await fetch(
        `${API_URL}/api/nuevos-usuarios/?fecha_desde=${firstDayStr}`
      );
      if (newUsersRes.ok) {
        const data = await newUsersRes.json();
        setNewUsersThisMonth(
          Array.isArray(data) ? data.length : data.count || 0
        );
      }

      // Fetch usuarios validados por centro del último corte - usar todos los centros disponibles
      if (centrosNombres.length > 0) {
        console.log("Centros disponibles:", centrosNombres);
        const allCentrosRes = await fetch(
          `${API_URL}/api/corte-fonasa/?summary_only=true&centros=${centrosNombres.join(
            ","
          )}`
        );
        if (allCentrosRes.ok) {
          const data = await allCentrosRes.json();
          console.log("Datos de corte por centro:", data);
          if (data.by_centro && data.by_centro.length > 0) {
            const validatedMap: Record<string, number> = {};
            data.by_centro.forEach(
              (centro: {
                centro: string;
                data: Array<{ validated?: number }>;
              }) => {
                // Tomar el último mes (más reciente) de cada centro
                if (centro.data && centro.data.length > 0) {
                  validatedMap[centro.centro] = centro.data[0].validated || 0;
                }
              }
            );
            console.log("Mapa de validados por centro:", validatedMap);
            setValidatedByCenter(validatedMap);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar los datos del dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCentros]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aplicar filtros
  const handleApplyFilters = (centros: string[], monthsRange: string) => {
    setSelectedMonthsRange(monthsRange);
    setSelectedCentros(centros);
  };

  // Estadísticas del último corte
  const stats = useMemo(() => {
    if (!corteData?.summary?.[0]) {
      return {
        total: 0,
        validated: 0,
        nonValidated: 0,
        totalCortes: 0,
        toReview: 0,
        newThisMonth: newUsersThisMonth,
      };
    }

    const lastCorte = corteData.summary[0];
    const total = lastCorte.total;
    const validated = lastCorte.validated;
    const nonValidated = lastCorte.nonValidated;

    // Total de cortes es la suma de todos los meses
    const totalCortes = corteData.summary.length;

    // Los "a revisar" son los no validados que requieren atención
    const toReview = nonValidated;

    return {
      total,
      validated,
      nonValidated,
      totalCortes,
      toReview,
      newThisMonth: newUsersThisMonth,
    };
  }, [corteData, newUsersThisMonth]);

  // Estadísticas para el carrusel
  const carouselStats = useMemo(() => {
    // Obtener datos del último corte (el más reciente)
    const ultimoCorte = corteData?.summary?.[0];
    const totalUsuarios = ultimoCorte?.total || 0;
    const validados = ultimoCorte?.validated || 0;
    const pendientes =
      totalUsuarios - validados - (ultimoCorte?.nonValidated || 0);
    const ultimaCarga = ultimoCorte?.label || "N/A";

    return {
      totalUsuarios,
      validados,
      pendientes,
      ultimaCarga,
      totalCargas: corteData?.summary?.length || 0,
      promedioExito: 95.5,
      validadosPorCentro: validatedByCenter,
    };
  }, [corteData, validatedByCenter]);

  // Generar descripción para los gráficos
  const graphDescription = useMemo(() => {
    const lastCorteMonth = corteData?.summary?.[0];
    let desc = "";

    if (selectedMonthsRange === "ULTIMO") {
      desc = lastCorteMonth ? `${lastCorteMonth.label}` : "Último corte";
    } else {
      desc = `Últimos ${selectedMonthsRange} meses`;
    }

    if (selectedCentros.length > 0) {
      if (selectedCentros.length === 1) {
        desc += ` - ${selectedCentros[0]}`;
      } else {
        desc += ` - ${selectedCentros.length} centros`;
      }
    }

    return desc;
  }, [selectedMonthsRange, corteData?.summary, selectedCentros]);

  // Datos para gráficos
  const corteChartData = useMemo(() => {
    if (!corteData?.summary) return [];

    // Si hay datos agrupados por centro
    if (corteData?.by_centro && corteData.by_centro.length > 0) {
      const allPeriods = new Set<string>();
      corteData.by_centro.forEach((centroDatos) => {
        centroDatos.data.forEach((item) => allPeriods.add(item.month));
      });

      const sortedPeriods = Array.from(allPeriods).sort(); // Orden normal (antiguos primero)

      let periodsToShow = sortedPeriods;
      if (selectedMonthsRange !== "ULTIMO") {
        const monthsToShow = parseInt(selectedMonthsRange);
        periodsToShow = sortedPeriods.slice(-monthsToShow); // Tomar los últimos N meses
      } else {
        periodsToShow = sortedPeriods.slice(-1); // Tomar el último mes
      }

      return periodsToShow.map((periodo) => {
        const dataPoint: Record<string, string | number> = { periodo };

        corteData.by_centro!.forEach((centroDatos) => {
          const monthData = centroDatos.data.find((d) => d.month === periodo);
          if (monthData) {
            dataPoint[`${centroDatos.centro}_total`] = monthData.total;
            dataPoint[`${centroDatos.centro}_validated`] = monthData.validated;
            dataPoint[`${centroDatos.centro}_nonValidated`] =
              monthData.nonValidated;
          }
        });

        return dataPoint;
      });
    }

    // Sin centros filtrados: datos agregados
    let dataToShow = corteData.summary;
    if (selectedMonthsRange !== "ULTIMO") {
      const monthsToShow = parseInt(selectedMonthsRange);
      dataToShow = dataToShow.slice(0, monthsToShow).reverse(); // Invertir para que antiguos estén primero
    } else {
      dataToShow = dataToShow.slice(0, 1);
    }

    return dataToShow.map((item) => ({
      periodo: item.month,
      total: item.total,
      validated: item.validated,
      nonValidated: item.nonValidated,
    }));
  }, [corteData, selectedMonthsRange]);

  // Centros para gráfico
  const centrosParaGrafico = useMemo(() => {
    if (!corteData?.by_centro || corteData.by_centro.length === 0) {
      return [];
    }

    const colores = [
      "#3b82f6", // blue - CESFAM Alberto Reyes
      "#10b981", // green - Cerro Estanque El Santo
      "#f59e0b", // amber
      "#ec4899", // pink
      "#8b5cf6", // purple
      "#06b6d4", // cyan
      "#f97316", // orange
      "#14b8a6", // teal
    ];

    return corteData.by_centro.map((c, index) => ({
      nombre: c.centro,
      color: colores[index % colores.length],
    }));
  }, [corteData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Saludo Dinámico */}
        <div className="mb-6">
          <DynamicGreeting userName={user?.nombre || "Usuario"} />
        </div>

        {/* Contenido Principal */}
        <div className="space-y-6">
          {/* Carrusel de Información */}
          <InfoCarousel estadisticas={carouselStats} />

          {/* Estadísticas Principales */}
          <ModernStatsSection
            stats={stats}
            loading={loading}
            formatNumber={formatNumber}
          />

          {/* Filtros Avanzados y Gráficos */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Filtros */}
            <div className="xl:col-span-3">
              <AdvancedChartFilters
                centrosDisponibles={centrosDisponibles}
                onApplyFilters={handleApplyFilters}
                initialMonthsRange={selectedMonthsRange}
                initialCentros={selectedCentros}
              />
            </div>

            {/* Gráficos */}
            <div className="xl:col-span-9">
              {!loading && (
                <ModernChartsSection
                  lineChartData={corteChartData}
                  centrosParaGrafico={centrosParaGrafico}
                  graphDescription={graphDescription}
                  loading={loading}
                  formatNumber={formatNumber}
                />
              )}
            </div>
          </div>

          {/* Tabs de Contenido */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-lg transition-all"
              >
                <Eye className="w-4 h-4" />
                Vista General
              </TabsTrigger>
              <TabsTrigger
                value="nuevos-usuarios"
                className="flex items-center gap-2 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-950/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300 rounded-lg transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Nuevos Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="historial"
                className="flex items-center gap-2 data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-950/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 rounded-lg transition-all"
              >
                <FileUp className="w-4 h-4" />
                Historial de Cargas
              </TabsTrigger>
            </TabsList>

            {/* Vista General */}
            <TabsContent value="overview">
              <div className="grid gap-6">
                <div className="text-center p-12 bg-white dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Dashboard Overview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Utiliza los filtros para personalizar tu vista y analizar
                    los datos
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Nuevos Usuarios */}
            <TabsContent value="nuevos-usuarios">
              <NuevosUsuariosSection />
            </TabsContent>

            {/* Historial de Cargas */}
            <TabsContent value="historial">
              <HistorialCargasSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
