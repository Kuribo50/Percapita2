"use client";

import type React from "react";
import { useState, useMemo } from "react";
import {
  Search,
  User,
  Calendar,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import {
  usuariosService,
  BuscarUsuarioResponse,
} from "@/services/usuarios.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function BuscarUsuarioPage() {
  const [run, setRun] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<BuscarUsuarioResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!run.trim()) {
      setError("Por favor ingrese un RUT");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    const response = await usuariosService.buscarUsuario(run.trim());

    if (response.success && response.data) {
      setResultado(response.data);
      // si no se encontró, lo tratamos como estado "sin registros", no como error técnico
      if (!response.data.encontrado) {
        // puedes dejar error en null para que no salga el Alert rojo
        setError(null);
      }
    } else {
      setError(response.error?.message || "Error al buscar usuario");
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatRunInput = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (!cleaned) return "";
    if (cleaned.length === 1) return cleaned;
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    return `${body}-${dv}`;
  };

  const handleRunChange = (value: string) => {
    const formatted = formatRunInput(value);
    setRun(formatted);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("es-CL");
  };

  const cortesValidados = resultado
    ? resultado.cortes_por_mes.filter((mes) => mes.validado).length
    : 0;
  const cortesNoValidados = resultado
    ? resultado.cortes_por_mes.filter((mes) => !mes.validado).length
    : 0;

  // Timeline de izquierda (más antiguo) a derecha (más reciente)
  const cortesOrdenados = useMemo(
    () =>
      resultado
        ? [...resultado.cortes_por_mes].sort((a, b) => {
            const da = a.fecha_corte ? new Date(a.fecha_corte).getTime() : 0;
            const db = b.fecha_corte ? new Date(b.fecha_corte).getTime() : 0;
            return da - db; // antiguo -> nuevo
          })
        : [],
    [resultado]
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card className="border border-slate-100 shadow-sm backdrop-blur supports-backdrop-filter:bg-white/80 animate-in fade-in duration-500">
        <CardHeader className="space-y-2 pb-3">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 font-semibold text-slate-900">
            <Search className="h-5 w-5 text-blue-500" />
            Buscar usuario por RUT
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Ingresa el RUN para ver la información sincronizada de FONASA y HP
            Trakcare.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full gap-2">
              <Input
                type="text"
                placeholder="Ej: 12345678-9"
                value={run}
                onChange={(e) => handleRunChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-base sm:text-lg rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                size="default"
                className="rounded-xl px-5 sm:px-7 whitespace-nowrap"
              >
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <span className="uppercase tracking-wide">
              Último RUN consultado
            </span>
            <span className="font-medium text-slate-900 text-sm">
              {resultado?.run || "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Error técnico (falló la petición, no "sin registros") */}
      {error && !resultado && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pantalla de error de RUT (no se encontraron registros) */}
      {resultado && !resultado.encontrado && (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="py-6 flex gap-4 items-start">
            <div className="mt-1">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-900">
                No se encontraron registros para el RUT{" "}
                <span className="underline">{resultado.run}</span>.
              </p>
              <p className="text-xs text-amber-800">
                Verifica que el RUN esté bien escrito (sin puntos, con guion y
                dígito verificador correcto). Si el problema persiste, el
                usuario podría no estar inscrito en FONASA, HP Trakcare ni en
                Nuevos Usuarios.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {resultado && resultado.encontrado && (
        <div className="space-y-5">
          {/* Widgets compactos */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 animate-in fade-in-50 duration-500">
            <div className="rounded-xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Cortes
                FONASA
              </p>
              <p className="mt-1.5 text-xl font-semibold text-slate-900">
                {resultado.total_meses}
              </p>
              <div className="mt-1.5 flex gap-3 text-[11px] font-medium">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {cortesValidados} validados
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  {cortesNoValidados} pendientes
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                <User className="h-3.5 w-3.5 text-blue-500" /> HP Trakcare
              </p>
              <p className="mt-1.5 text-base font-semibold text-slate-900">
                {resultado.hp_trakcare ? "Con registro" : "Sin registro"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {resultado.hp_trakcare?.centro_inscripcion ||
                  "Centro no informado"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                <UserPlus className="h-3.5 w-3.5 text-purple-500" /> Nuevos
                usuarios
              </p>
              <p className="mt-1.5 text-base font-semibold text-slate-900">
                {resultado.total_nuevos_usuarios}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {resultado.total_nuevos_usuarios > 0
                  ? "Revisa el detalle en la pestaña correspondiente"
                  : "Sin inscripciones previas"}
              </p>
            </div>
          </div>

          {/* Alerta de Usuario Nuevo sin Cortes */}
          {resultado.nuevos_usuarios &&
            resultado.nuevos_usuarios.length > 0 &&
            resultado.cortes_por_mes.length === 0 && (
              <Alert className="border-purple-200 bg-purple-50 dark:from-purple-950 dark:to-pink-950">
                <UserPlus className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-900 dark:text-purple-100 text-sm">
                  <strong>Usuario nuevo detectado:</strong> Se inscribió el{" "}
                  <strong>
                    {formatDate(resultado.nuevos_usuarios[0].fecha_inscripcion)}
                  </strong>{" "}
                  ({resultado.nuevos_usuarios[0].periodo}), pero aún no aparece
                  validado en ningún corte FONASA.
                </AlertDescription>
              </Alert>
            )}

          {/* Detalle en Tabs */}
          <Tabs defaultValue="fonasa" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="fonasa" className="text-xs sm:text-sm">
                FONASA
              </TabsTrigger>
              <TabsTrigger value="trakcare" className="text-xs sm:text-sm">
                HP Trakcare
              </TabsTrigger>
              <TabsTrigger value="nuevos" className="text-xs sm:text-sm">
                Nuevos usuarios
              </TabsTrigger>
            </TabsList>

            {/* FONASA */}
            <TabsContent value="fonasa">
              <Card className="h-fit">
                <CardHeader className="bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 py-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Sistema FONASA
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Datos extraídos desde los cortes mensuales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {resultado.cortes_por_mes.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const primerMes = resultado.cortes_por_mes[0];
                        const primerCorte = primerMes?.registros[0];
                        if (!primerCorte) return null;
                        const centroValidador =
                          primerCorte.centro_salud ||
                          primerCorte.nombre_centro ||
                          "N/A";
                        const estadoAceptado =
                          (
                            primerCorte.aceptado_rechazado || ""
                          ).toUpperCase() === "ACEPTADO";

                        return (
                          <div className="space-y-3 pb-3 border-b">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Nombre completo
                              </p>
                              <p className="font-semibold text-base sm:text-lg">
                                {primerCorte.nombre_completo || "N/A"}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  RUN
                                </p>
                                <p className="font-medium">{primerCorte.run}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Tramo
                                </p>
                                <p className="font-medium">
                                  {primerCorte.tramo || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Nombres
                                </p>
                                <p className="font-medium">
                                  {primerCorte.nombres || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Apellido paterno
                                </p>
                                <p className="font-medium">
                                  {primerCorte.ap_paterno || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Apellido materno
                                </p>
                                <p className="font-medium">
                                  {primerCorte.ap_materno || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Fecha de nacimiento
                                </p>
                                <p className="font-medium">
                                  {formatDate(primerCorte.fecha_nacimiento)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Género
                                </p>
                                <p className="font-medium">
                                  {primerCorte.genero || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Centro validador
                                </p>
                                <p className="font-medium">{centroValidador}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Validación FONASA
                                </p>
                                <Badge
                                  variant={
                                    estadoAceptado ? "default" : "destructive"
                                  }
                                  className="mt-1 text-xs"
                                >
                                  {primerCorte.aceptado_rechazado || "SIN DATO"}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Fecha última modificación
                                </p>
                                <p className="font-medium">
                                  {formatDate(primerMes.fecha_corte)}
                                </p>
                              </div>

                              {/* Motivo con círculo de color */}
                              {primerCorte.motivo && (
                                <div className="md:col-span-1 md:col-start-1 md:col-end-4">
                                  <p className="text-xs text-muted-foreground">
                                    Motivo
                                  </p>
                                  <div
                                    className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${
                                      estadoAceptado
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                    }`}
                                  >
                                    <span
                                      className={`h-2 w-2 rounded-full ${
                                        estadoAceptado
                                          ? "bg-emerald-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                    <span>{primerCorte.motivo}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Timeline Horizontal de Validaciones (izquierda antiguo, derecha actual) */}
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Historial de validaciones
                        </h4>

                        <div className="relative">
                          <div className="absolute top-4 left-0 right-0 h-0.5 bg-linear-to-r from-orange-200 via-amber-200 to-orange-200 dark:from-orange-800 dark:via-amber-800 dark:to-orange-800" />

                          <div className="flex overflow-x-auto pb-3 gap-4 relative scrollbar-thin">
                            {cortesOrdenados.map((mes) => (
                              <div
                                key={mes.mes_key}
                                className="flex flex-col items-center min-w-[96px] relative"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border-2 z-10 ${
                                    mes.validado
                                      ? "bg-green-500 border-green-600 shadow-sm shadow-green-500/40"
                                      : "bg-red-500 border-red-600 shadow-sm shadow-red-500/40"
                                  }`}
                                />
                                <p className="text-[11px] font-semibold mt-1 text-center whitespace-nowrap">
                                  {mes.mes}
                                </p>
                                <Badge
                                  variant={
                                    mes.validado ? "default" : "destructive"
                                  }
                                  className="text-[10px] mt-1 whitespace-nowrap"
                                >
                                  {mes.validado
                                    ? "✓ Validado"
                                    : "✗ No validado"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="text-muted-foreground">
                              {
                                resultado.cortes_por_mes.filter(
                                  (m) => m.validado
                                ).length
                              }{" "}
                              validados
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-muted-foreground">
                              {
                                resultado.cortes_por_mes.filter(
                                  (m) => !m.validado
                                ).length
                              }{" "}
                              no validados
                            </span>
                          </div>
                          <div className="ml-auto text-muted-foreground">
                            Total: {resultado.total_meses}{" "}
                            {resultado.total_meses === 1 ? "mes" : "meses"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="font-medium">
                        No hay registros en Cortes FONASA
                      </p>
                      <p>Este usuario no tiene cortes mensuales.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HP Trakcare */}
            <TabsContent value="trakcare">
              <Card className="h-fit">
                <CardHeader className="bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 py-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="h-5 w-5 text-cyan-600" />
                    HP Trakcare
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Sistema hospitalario.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {resultado.hp_trakcare ? (
                    <div className="space-y-4 text-sm">
                      {/* Identificadores */}
                      <div className="pb-3 border-b">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          🔖 Identificadores
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Código familia
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.cod_familia || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Relación parentesco
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.relacion_parentezco ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              ID Trakcare
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.id_trakcare || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Código registro
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.cod_registro || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Datos Personales */}
                      <div className="pb-3 border-b">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          👤 Datos personales
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              RUN
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.run || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Nombre
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.nombre || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Apellido paterno
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.ap_paterno || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Apellido materno
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.ap_materno || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Género
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.genero || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Fecha nacimiento
                            </p>
                            <p className="font-medium">
                              {formatDate(
                                resultado.hp_trakcare.fecha_nacimiento
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Edad
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.edad
                                ? `${resultado.hp_trakcare.edad} años`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Estado vital
                            </p>
                            <Badge
                              variant={
                                resultado.hp_trakcare.esta_vivo
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs mt-1"
                            >
                              {resultado.hp_trakcare.esta_vivo
                                ? "✓ Vivo"
                                : "✝ Fallecido"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Contacto */}
                      <div className="pb-3 border-b">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          Contacto
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Dirección
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.direccion || "N/A"}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Teléfono
                              </p>
                              <p>{resultado.hp_trakcare.telefono || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Celular
                              </p>
                              <p>
                                {resultado.hp_trakcare.telefono_celular ||
                                  "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Teléfono recado
                              </p>
                              <p>
                                {resultado.hp_trakcare.telefono_recado || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de Salud */}
                      <div className="pb-3 border-b">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          🏥 Información de salud
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Etnia
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.etnia || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Nacionalidad
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.nacionalidad || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Servicio de salud
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.servicio_salud || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Centro de inscripción
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.centro_inscripcion ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Sector
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.sector || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Previsión
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.prevision || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Plan Trakcare
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.plan_trakcare || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              PRAIS
                            </p>
                            <p className="font-medium">
                              {resultado.hp_trakcare.prais_trakcare || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Fechas Relevantes */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          🗓️ Fechas relevantes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Fecha incorporación
                            </p>
                            <p className="font-medium">
                              {formatDate(
                                resultado.hp_trakcare.fecha_incorporacion
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Fecha última modificación
                            </p>
                            <p className="font-medium">
                              {formatDate(
                                resultado.hp_trakcare.fecha_ultima_modif
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Fecha defunción
                            </p>
                            <p className="font-medium">
                              {formatDate(
                                resultado.hp_trakcare.fecha_defuncion
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="font-medium">
                        No hay registros en HP Trakcare
                      </p>
                      <p>Este usuario no está en el sistema hospitalario.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Nuevos Usuarios */}
            <TabsContent value="nuevos">
              {resultado.nuevos_usuarios &&
              resultado.nuevos_usuarios.length > 0 ? (
                <Card>
                  <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 py-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <UserPlus className="h-5 w-5 text-purple-600" />
                      Nuevos usuarios ({resultado.total_nuevos_usuarios})
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Registros de inscripciones previas al corte mensual.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {resultado.nuevos_usuarios.map((nuevo) => (
                        <div
                          key={nuevo.id}
                          className="border rounded-lg p-3 space-y-2 hover:bg-muted/30 transition-colors text-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h5 className="font-semibold text-sm">
                                {nuevo.nombre_completo}
                              </h5>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                Periodo: {nuevo.periodo} • Inscrito el{" "}
                                {formatDate(nuevo.fecha_inscripcion)}
                              </p>
                            </div>
                            <div className="flex gap-1.5 flex-col items-start sm:items-end">
                              <Badge
                                variant={
                                  nuevo.estado === "VALIDADO"
                                    ? "default"
                                    : nuevo.estado === "NO_VALIDADO"
                                    ? "destructive"
                                    : nuevo.estado === "FALLECIDO"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-[11px]"
                              >
                                {nuevo.estado_display}
                              </Badge>
                              {nuevo.revisado && (
                                <Badge
                                  variant="outline"
                                  className="gap-1 text-[11px]"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Revisado
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                            {nuevo.nacionalidad && (
                              <div>
                                <p className="text-muted-foreground">
                                  Nacionalidad
                                </p>
                                <p className="font-medium text-[12px]">
                                  {nuevo.nacionalidad}
                                </p>
                              </div>
                            )}
                            {nuevo.etnia && (
                              <div>
                                <p className="text-muted-foreground">Etnia</p>
                                <p className="font-medium text-[12px]">
                                  {nuevo.etnia}
                                </p>
                              </div>
                            )}
                            {nuevo.sector && (
                              <div>
                                <p className="text-muted-foreground">Sector</p>
                                <p className="font-medium text-[12px]">
                                  {nuevo.sector}
                                </p>
                              </div>
                            )}
                            {nuevo.subsector && (
                              <div>
                                <p className="text-muted-foreground">
                                  Subsector
                                </p>
                                <p className="font-medium text-[12px]">
                                  {nuevo.subsector}
                                </p>
                              </div>
                            )}
                            {nuevo.centro && (
                              <div>
                                <p className="text-muted-foreground">Centro</p>
                                <p className="font-medium text-[12px]">
                                  {nuevo.centro}
                                </p>
                              </div>
                            )}
                            {nuevo.establecimiento && (
                              <div>
                                <p className="text-muted-foreground">
                                  Establecimiento
                                </p>
                                <p className="font-medium text-[12px]">
                                  {nuevo.establecimiento}
                                </p>
                              </div>
                            )}
                            {nuevo.codigo_percapita && (
                              <div>
                                <p className="text-muted-foreground">
                                  Código per cápita
                                </p>
                                <p className="font-medium text-[12px]">
                                  {nuevo.codigo_percapita}
                                </p>
                              </div>
                            )}
                          </div>

                          {(nuevo.observaciones ||
                            nuevo.observaciones_trakcare) && (
                            <div className="space-y-1.5 pt-2 border-t">
                              {nuevo.observaciones && (
                                <div>
                                  <p className="text-[11px] text-muted-foreground font-semibold">
                                    Observaciones
                                  </p>
                                  <p className="text-[12px] bg-muted/50 p-2 rounded">
                                    {nuevo.observaciones}
                                  </p>
                                </div>
                              )}
                              {nuevo.observaciones_trakcare && (
                                <div>
                                  <p className="text-[11px] text-muted-foreground font-semibold">
                                    Observaciones Trakcare
                                  </p>
                                  <p className="text-[12px] bg-muted/50 p-2 rounded">
                                    {nuevo.observaciones_trakcare}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {nuevo.revisado && (
                            <div className="pt-1 border-t text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <CheckCircle className="h-3 w-3" />
                              Revisado por {nuevo.revisado_por || "Sistema"}
                              {nuevo.revisado_el &&
                                ` el ${formatDate(nuevo.revisado_el)}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    No hay registros en Nuevos Usuarios para este RUT.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
