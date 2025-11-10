"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Save,
  X,
  Users,
  Database,
  BookOpen,
  Power,
  PowerOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllCatalogos,
  createEtnia,
  updateEtnia,
  createNacionalidad,
  updateNacionalidad,
  createSector,
  updateSector,
  createSubsector,
  updateSubsector,
  createEstablecimiento,
  updateEstablecimiento,
  createCentroSalud,
  updateCentroSalud,
  type Etnia,
  type Nacionalidad,
  type Sector,
  type Subsector,
  type Establecimiento,
  type CentroSalud,
} from "@/lib/catalogos";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type CatalogoType =
  | "etnia"
  | "nacionalidad"
  | "sector"
  | "subsector"
  | "establecimiento"
  | "centro";
type CatalogoItem =
  | Etnia
  | Nacionalidad
  | Sector
  | Subsector
  | Establecimiento
  | CentroSalud;

interface FormData {
  nombre: string;
  codigo: string;
  codigoPais?: string;
  color?: string;
  orden: number;
  activo: boolean;
  sectorId?: number;
  establecimientoId?: number;
}

// Componente de formulario genérico (fuera para evitar re-creación)
const FormularioCatalogo = ({
  tipo,
  formData,
  setFormData,
  editingItem,
  resetForm,
  handleSubmit,
  sectores,
  establecimientos,
}: {
  tipo: CatalogoType;
  formData: FormData;
  setFormData: (data: FormData) => void;
  editingItem: CatalogoItem | null;
  resetForm: () => void;
  handleSubmit: (tipo: CatalogoType) => void;
  sectores: Sector[];
  establecimientos: Establecimiento[];
}) => (
  <Card className="p-6 mb-6 bg-card border">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">
        {editingItem ? "Editar" : "Nuevo"}{" "}
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </h3>
      <Button variant="ghost" size="sm" onClick={resetForm}>
        <X className="w-4 h-4" />
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Nombre del registro"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigo">Código *</Label>
        <Input
          id="codigo"
          value={formData.codigo}
          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
          placeholder="Código único"
        />
      </div>

      {tipo === "nacionalidad" && (
        <div className="space-y-2">
          <Label htmlFor="codigoPais">Código País</Label>
          <Input
            id="codigoPais"
            value={formData.codigoPais || ""}
            onChange={(e) =>
              setFormData({ ...formData, codigoPais: e.target.value })
            }
            placeholder="Ej: CL, AR, PE"
          />
        </div>
      )}

      {(tipo === "sector" || tipo === "subsector") && (
        <div className="space-y-2">
          <Label htmlFor="color">Color (Hex)</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color || "#000000"}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-20"
            />
            <Input
              value={formData.color || ""}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="#000000"
            />
          </div>
        </div>
      )}

      {tipo === "subsector" && (
        <div className="space-y-2">
          <Label htmlFor="sectorId">Sector</Label>
          <Select
            value={formData.sectorId?.toString() || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, sectorId: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un sector" />
            </SelectTrigger>
            <SelectContent>
              {sectores.map((sector) => (
                <SelectItem key={sector.id} value={sector.id.toString()}>
                  {sector.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {tipo === "centro" && (
        <div className="space-y-2">
          <Label htmlFor="establecimientoId">Establecimiento</Label>
          <Select
            value={formData.establecimientoId?.toString() || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, establecimientoId: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un establecimiento" />
            </SelectTrigger>
            <SelectContent>
              {establecimientos.map((est) => (
                <SelectItem key={est.id} value={est.id.toString()}>
                  {est.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="orden">Orden</Label>
        <Input
          id="orden"
          type="number"
          value={formData.orden}
          onChange={(e) =>
            setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })
          }
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activo">Estado</Label>
        <Select
          value={formData.activo ? "true" : "false"}
          onValueChange={(value) =>
            setFormData({ ...formData, activo: value === "true" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Activo</SelectItem>
            <SelectItem value="false">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="flex gap-2 mt-6">
      <Button onClick={() => handleSubmit(tipo)} className="flex-1">
        <Save className="w-4 h-4 mr-2" />
        {editingItem ? "Actualizar" : "Crear"}
      </Button>
      <Button variant="outline" onClick={resetForm}>
        Cancelar
      </Button>
    </div>
  </Card>
);

// Componente de tabla genérica (fuera para evitar re-creación)
const TablaCatalogo = ({
  items,
  tipo,
  showInactivos,
  setShowInactivos,
  handleEdit,
  handleToggleActivo,
  handleDeletePermanent,
  showColor = false,
  showCodigoPais = false,
  showSector = false,
  showEstablecimiento = false,
}: {
  items: CatalogoItem[];
  tipo: CatalogoType;
  showInactivos: boolean;
  setShowInactivos: (value: boolean) => void;
  handleEdit: (item: CatalogoItem, tipo: CatalogoType) => void;
  handleToggleActivo: (item: CatalogoItem, tipo: CatalogoType) => void;
  handleDeletePermanent: (item: CatalogoItem, tipo: CatalogoType) => void;
  showColor?: boolean;
  showCodigoPais?: boolean;
  showSector?: boolean;
  showEstablecimiento?: boolean;
}) => {
  // Filtrar items según showInactivos
  const itemsFiltrados = showInactivos
    ? items
    : items.filter((item) => item.activo);

  return (
    <div className="space-y-4">
      {/* Filtro de activos/inactivos */}
      <div className="flex items-center gap-3">
        <Switch
          id="show-inactivos"
          checked={showInactivos}
          onCheckedChange={setShowInactivos}
        />
        <Label
          htmlFor="show-inactivos"
          className="text-sm font-normal cursor-pointer"
        >
          Mostrar registros inactivos
        </Label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Nombre</th>
              <th className="text-left py-3 px-4 font-medium">Código</th>
              {showCodigoPais && (
                <th className="text-left py-3 px-4 font-medium">Código País</th>
              )}
              {showColor && (
                <th className="text-left py-3 px-4 font-medium">Color</th>
              )}
              {showSector && (
                <th className="text-left py-3 px-4 font-medium">Sector</th>
              )}
              {showEstablecimiento && (
                <th className="text-left py-3 px-4 font-medium">
                  Establecimiento
                </th>
              )}
              <th className="text-left py-3 px-4 font-medium">Orden</th>
              <th className="text-left py-3 px-4 font-medium">Estado</th>
              <th className="text-right py-3 px-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {itemsFiltrados.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-border hover:bg-muted/50 transition-colors ${
                  !item.activo ? "opacity-50 bg-muted/20" : ""
                }`}
              >
                <td className="py-3 px-4">
                  <span
                    className={
                      !item.activo ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {item.nombre}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {item.codigo || "-"}
                  </code>
                </td>
                {showCodigoPais && (
                  <td className="py-3 px-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {"codigoPais" in item ? item.codigoPais : "-"}
                    </code>
                  </td>
                )}
                {showColor && (
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-border"
                        style={{
                          backgroundColor:
                            "color" in item ? item.color || "#ccc" : "#ccc",
                        }}
                      />
                      <code className="text-xs">
                        {"color" in item ? item.color : "-"}
                      </code>
                    </div>
                  </td>
                )}
                {showSector && (
                  <td className="py-3 px-4">
                    {"sectorNombre" in item ? item.sectorNombre : "-"}
                  </td>
                )}
                {showEstablecimiento && (
                  <td className="py-3 px-4">
                    {"establecimientoNombre" in item
                      ? item.establecimientoNombre
                      : "-"}
                  </td>
                )}
                <td className="py-3 px-4">{item.orden}</td>
                <td className="py-3 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActivo(item, tipo)}
                    className="gap-2"
                  >
                    {item.activo ? (
                      <>
                        <Power className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Activo</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Inactivo</span>
                      </>
                    )}
                  </Button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item, tipo)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const accion = item.activo ? "desactivar" : "reactivar";
                        if (
                          confirm(`¿Estás seguro de ${accion} este registro?`)
                        ) {
                          handleToggleActivo(item, tipo);
                        }
                      }}
                      title={item.activo ? "Desactivar" : "Reactivar"}
                      className={
                        item.activo
                          ? "hover:text-orange-600"
                          : "hover:text-green-600"
                      }
                    >
                      {item.activo ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePermanent(item, tipo)}
                      title="Eliminar permanentemente"
                      className="hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ConfiguracionPage() {
  const [mainTab, setMainTab] = useState<"nuevos" | "base-datos" | "usuarios">(
    "nuevos"
  );
  const [etnias, setEtnias] = useState<Etnia[]>([]);
  const [nacionalidades, setNacionalidades] = useState<Nacionalidad[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [subsectores, setSubsectores] = useState<Subsector[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(
    []
  );
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
  const [showForm, setShowForm] = useState<CatalogoType | null>(null);
  const [showInactivos, setShowInactivos] = useState(true); // Mostrar inactivos por defecto
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    codigo: "",
    orden: 0,
    activo: true,
  });

  useEffect(() => {
    loadCatalogos();
  }, []);

  const loadCatalogos = async () => {
    try {
      const data = await getAllCatalogos();
      setEtnias(data.etnias);
      setNacionalidades(data.nacionalidades);
      setSectores(data.sectores);
      setSubsectores(data.subsectores);
      setEstablecimientos(data.establecimientos);
      setCentros(data.centros_salud);
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      codigo: "",
      orden: 0,
      activo: true,
    });
    setEditingItem(null);
    setShowForm(null);
  };

  const handleEdit = (item: CatalogoItem, tipo: CatalogoType) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      codigo: item.codigo || "",
      codigoPais: "codigoPais" in item ? item.codigoPais : undefined,
      color: "color" in item ? item.color : undefined,
      orden: item.orden,
      activo: item.activo,
      sectorId: "sectorId" in item ? item.sectorId : undefined,
      establecimientoId:
        "establecimientoId" in item ? item.establecimientoId : undefined,
    });
    setShowForm(tipo);
  };

  const handleSubmit = async (tipo: CatalogoType) => {
    try {
      const payload: Record<string, string | number | boolean | undefined> = {
        nombre: formData.nombre,
        codigo: formData.codigo,
        orden: formData.orden,
        activo: formData.activo,
      };

      if (formData.codigoPais) payload.codigoPais = formData.codigoPais;
      if (formData.color) payload.color = formData.color;
      if (formData.sectorId) payload.sectorId = formData.sectorId;
      if (formData.establecimientoId)
        payload.establecimientoId = formData.establecimientoId;

      if (editingItem) {
        // Actualizar
        switch (tipo) {
          case "etnia":
            await updateEtnia(editingItem.id, payload);
            break;
          case "nacionalidad":
            await updateNacionalidad(editingItem.id, payload);
            break;
          case "sector":
            await updateSector(editingItem.id, payload);
            break;
          case "subsector":
            await updateSubsector(editingItem.id, payload);
            break;
          case "establecimiento":
            await updateEstablecimiento(editingItem.id, payload);
            break;
          case "centro":
            await updateCentroSalud(editingItem.id, payload);
            break;
        }
      } else {
        // Crear
        switch (tipo) {
          case "etnia":
            await createEtnia(payload);
            break;
          case "nacionalidad":
            await createNacionalidad(payload);
            break;
          case "sector":
            await createSector(payload);
            break;
          case "subsector":
            await createSubsector(payload);
            break;
          case "establecimiento":
            await createEstablecimiento(payload);
            break;
          case "centro":
            await createCentroSalud(payload);
            break;
        }
      }

      await loadCatalogos();

      // Limpiar formulario pero mantenerlo abierto
      setFormData({
        nombre: "",
        codigo: "",
        orden: 0,
        activo: true,
      });
      setEditingItem(null);
      // NO llamar a setShowForm(null) para mantener el formulario abierto
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el registro");
    }
  };

  const handleToggleActivo = async (item: CatalogoItem, tipo: CatalogoType) => {
    try {
      const payload = { ...item, activo: !item.activo };
      switch (tipo) {
        case "etnia":
          await updateEtnia(item.id, payload);
          break;
        case "nacionalidad":
          await updateNacionalidad(item.id, payload);
          break;
        case "sector":
          await updateSector(item.id, payload);
          break;
        case "subsector":
          await updateSubsector(item.id, payload);
          break;
        case "establecimiento":
          await updateEstablecimiento(item.id, payload);
          break;
        case "centro":
          await updateCentroSalud(item.id, payload);
          break;
      }
      await loadCatalogos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar el estado");
    }
  };

  const handleDeletePermanent = async (
    item: CatalogoItem,
    tipo: CatalogoType
  ) => {
    if (
      !confirm(
        `¿Estás SEGURO de eliminar PERMANENTEMENTE "${item.nombre}"? Esta acción NO se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      const endpoint = getEndpointForType(tipo);
      const response = await fetch(
        `${API_URL}/api/catalogos/${endpoint}/${item.id}/?permanent=true`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      await loadCatalogos();
      alert(`"${item.nombre}" eliminado permanentemente`);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el registro");
    }
  };

  const getEndpointForType = (tipo: CatalogoType): string => {
    const endpoints: Record<CatalogoType, string> = {
      etnia: "etnias",
      nacionalidad: "nacionalidades",
      sector: "sectores",
      subsector: "subsectores",
      establecimiento: "establecimientos",
      centro: "centros-salud",
    };
    return endpoints[tipo];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Configuración del Sistema
          </h1>
          <p className="text-muted-foreground">
            Administración de catálogos, bases de datos y usuarios
          </p>
        </div>
      </div>

      {/* Tabs Principales */}
      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as typeof mainTab)}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nuevos" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Configuración Nuevos Usuarios
          </TabsTrigger>
          <TabsTrigger value="base-datos" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Administración Base de Datos
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Administración de Usuarios
          </TabsTrigger>
        </TabsList>

        {/* SECCIÓN 1: CONFIGURACIÓN NUEVOS USUARIOS */}
        <TabsContent value="nuevos" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Catálogos para Nuevos Usuarios
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Gestiona los catálogos utilizados en el formulario de registro de
              nuevos usuarios
            </p>

            <Tabs defaultValue="etnias" className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="etnias">Etnias</TabsTrigger>
                <TabsTrigger value="nacionalidades">Nacionalidades</TabsTrigger>
                <TabsTrigger value="sectores">Sectores</TabsTrigger>
                <TabsTrigger value="subsectores">Subsectores</TabsTrigger>
                <TabsTrigger value="establecimientos">
                  Establecimientos
                </TabsTrigger>
                <TabsTrigger value="centros">Centros de Salud</TabsTrigger>
              </TabsList>

              {/* ETNIAS */}
              <TabsContent value="etnias">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Gestión de Etnias</h3>
                    <p className="text-sm text-muted-foreground">
                      Total: {etnias.length} registros (
                      {etnias.filter((e) => e.activo).length} activos,{" "}
                      {etnias.filter((e) => !e.activo).length} inactivos)
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setShowForm(showForm === "etnia" ? null : "etnia")
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Etnia
                  </Button>
                </div>
                {showForm === "etnia" && (
                  <FormularioCatalogo
                    tipo="etnia"
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    resetForm={resetForm}
                    handleSubmit={handleSubmit}
                    sectores={sectores}
                    establecimientos={establecimientos}
                  />
                )}
                <TablaCatalogo
                  items={etnias}
                  tipo="etnia"
                  showInactivos={showInactivos}
                  setShowInactivos={setShowInactivos}
                  handleEdit={handleEdit}
                  handleToggleActivo={handleToggleActivo}
                  handleDeletePermanent={handleDeletePermanent}
                />
              </TabsContent>

              {/* NACIONALIDADES */}
              <TabsContent value="nacionalidades">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Gestión de Nacionalidades
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total: {nacionalidades.length} registros (
                      {nacionalidades.filter((n) => n.activo).length} activos,{" "}
                      {nacionalidades.filter((n) => !n.activo).length}{" "}
                      inactivos)
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setShowForm(
                        showForm === "nacionalidad" ? null : "nacionalidad"
                      )
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Nacionalidad
                  </Button>
                </div>
                {showForm === "nacionalidad" && (
                  <FormularioCatalogo
                    tipo="nacionalidad"
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    resetForm={resetForm}
                    handleSubmit={handleSubmit}
                    sectores={sectores}
                    establecimientos={establecimientos}
                  />
                )}
                <TablaCatalogo
                  items={nacionalidades}
                  tipo="nacionalidad"
                  showInactivos={showInactivos}
                  setShowInactivos={setShowInactivos}
                  handleEdit={handleEdit}
                  handleToggleActivo={handleToggleActivo}
                  handleDeletePermanent={handleDeletePermanent}
                  showCodigoPais
                />
              </TabsContent>

              {/* SECTORES */}
              <TabsContent value="sectores">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Gestión de Sectores
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total: {sectores.length} registros (
                      {sectores.filter((s) => s.activo).length} activos,{" "}
                      {sectores.filter((s) => !s.activo).length} inactivos)
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setShowForm(showForm === "sector" ? null : "sector")
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Sector
                  </Button>
                </div>
                {showForm === "sector" && (
                  <FormularioCatalogo
                    tipo="sector"
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    resetForm={resetForm}
                    handleSubmit={handleSubmit}
                    sectores={sectores}
                    establecimientos={establecimientos}
                  />
                )}
                <TablaCatalogo
                  items={sectores}
                  tipo="sector"
                  showInactivos={showInactivos}
                  setShowInactivos={setShowInactivos}
                  handleEdit={handleEdit}
                  handleToggleActivo={handleToggleActivo}
                  handleDeletePermanent={handleDeletePermanent}
                  showColor
                />
              </TabsContent>

              {/* SUBSECTORES */}
              <TabsContent value="subsectores">
                {showForm === "subsector" && (
                  <FormularioCatalogo
                    tipo="subsector"
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    resetForm={resetForm}
                    handleSubmit={handleSubmit}
                    sectores={sectores}
                    establecimientos={establecimientos}
                  />
                )}
                <TablaCatalogo
                  items={subsectores}
                  tipo="subsector"
                  showInactivos={showInactivos}
                  setShowInactivos={setShowInactivos}
                  handleEdit={handleEdit}
                  handleToggleActivo={handleToggleActivo}
                  handleDeletePermanent={handleDeletePermanent}
                  showColor
                  showSector
                />
              </TabsContent>

              {/* ESTABLECIMIENTOS */}
              <TabsContent value="establecimientos">
                {showForm === "establecimiento" && (
                  <FormularioCatalogo
                    tipo="establecimiento"
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    resetForm={resetForm}
                    handleSubmit={handleSubmit}
                    sectores={sectores}
                    establecimientos={establecimientos}
                  />
                )}
                <TablaCatalogo
                  items={establecimientos}
                  tipo="establecimiento"
                  showInactivos={showInactivos}
                  setShowInactivos={setShowInactivos}
                  handleEdit={handleEdit}
                  handleToggleActivo={handleToggleActivo}
                  handleDeletePermanent={handleDeletePermanent}
                />
              </TabsContent>

              {/* CENTROS DE SALUD */}
              <TabsContent value="centros">
                {showForm === "centro" && (
                  <FormularioCatalogo
                    tipo="centro"
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    resetForm={resetForm}
                    handleSubmit={handleSubmit}
                    sectores={sectores}
                    establecimientos={establecimientos}
                  />
                )}
                <TablaCatalogo
                  items={centros}
                  tipo="centro"
                  showInactivos={showInactivos}
                  setShowInactivos={setShowInactivos}
                  handleEdit={handleEdit}
                  handleToggleActivo={handleToggleActivo}
                  handleDeletePermanent={handleDeletePermanent}
                  showEstablecimiento
                />
              </TabsContent>

              {/* CENTROS DE SALUD */}
              <TabsContent value="centros">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Gestión de Centros de Salud
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total: {centros.length} registros (
                      {centros.filter((c) => c.activo).length} activos,{" "}
                      {centros.filter((c) => !c.activo).length} inactivos)
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setShowForm(showForm === "centro" ? null : "centro")
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Centro
                  </Button>
                </div>
                {showForm === "centro" && (
                  <FormularioCatalogo
                    tipo="centro"
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    resetForm={resetForm}
                    handleSubmit={handleSubmit}
                    sectores={sectores}
                    establecimientos={establecimientos}
                  />
                )}
                <TablaCatalogo
                  items={centros}
                  tipo="centro"
                  showInactivos={showInactivos}
                  setShowInactivos={setShowInactivos}
                  handleEdit={handleEdit}
                  handleToggleActivo={handleToggleActivo}
                  handleDeletePermanent={handleDeletePermanent}
                  showEstablecimiento
                />
              </TabsContent>
            </Tabs>
          </Card>
        </TabsContent>

        {/* SECCIÓN 2: ADMINISTRACIÓN BASE DE DATOS */}
        <TabsContent value="base-datos">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Administración de Base de Datos
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Gestión de cortes FONASA, base TrakCare y validaciones
            </p>
            <div className="text-center py-12 text-muted-foreground">
              Funcionalidades de administración de base de datos (próximamente)
            </div>
          </Card>
        </TabsContent>

        {/* SECCIÓN 3: ADMINISTRACIÓN DE USUARIOS */}
        <TabsContent value="usuarios">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Administración de Usuarios del Sistema
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Gestión de cuentas de acceso al sistema
            </p>
            <div className="text-center py-12 text-muted-foreground">
              Gestión de usuarios registrados en el sistema (próximamente)
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
