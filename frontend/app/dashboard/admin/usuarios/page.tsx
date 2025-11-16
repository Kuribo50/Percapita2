"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Key, Shield, Building2, Search, Edit, Trash2 } from "lucide-react";
import { ModernCard, ModernCardHeader, ModernCardContent } from "@/components/ui/modern-card";
import { ModernTable, ModernEmptyState } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Usuario {
  id: number;
  username: string;
  nombre_completo: string;
  email: string;
  rol: "ADMIN" | "INFORMATICO" | "ADMINISTRATIVO";
  rol_display: string;
  centros: Array<{ id: number; nombre: string }>;
  centros_nombres: string[];
  activo: boolean;
  es_admin: boolean;
  ultimo_acceso?: string;
  creado_el: string;
  creado_por?: string;
}

interface Rol {
  value: string;
  label: string;
}

interface Centro {
  id: number;
  nombre: string;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCentrosModal, setShowCentrosModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Formularios
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombre_completo: "",
    email: "",
    rol: "ADMINISTRATIVO",
    centros_ids: [] as number[],
    activo: true,
  });

  const [passwordData, setPasswordData] = useState({ nueva_password: "" });
  const [centrosSeleccionados, setCentrosSeleccionados] = useState<number[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    loadUsuarios();
    loadRoles();
    loadCentros();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/usuarios/`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/usuarios/roles/`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Error al cargar roles:", error);
    }
  };

  const loadCentros = async () => {
    try {
      const response = await fetch(`${API_URL}/api/catalogos/establecimientos/`);
      if (response.ok) {
        const data = await response.json();
        setCentros(data);
      }
    } catch (error) {
      console.error("Error al cargar centros:", error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Usuario creado exitosamente");
        setShowCreateModal(false);
        loadUsuarios();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al crear usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear usuario");
    }
  };

  const handleEdit = async () => {
    if (!selectedUsuario) return;

    try {
      const response = await fetch(`${API_URL}/api/usuarios/${selectedUsuario.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: formData.nombre_completo,
          email: formData.email,
          rol: formData.rol,
          centros_ids: formData.centros_ids,
          activo: formData.activo,
        }),
      });

      if (response.ok) {
        toast.success("Usuario actualizado exitosamente");
        setShowEditModal(false);
        loadUsuarios();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar usuario");
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`¿Está seguro de eliminar al usuario ${usuario.username}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Usuario eliminado exitosamente");
        loadUsuarios();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar usuario");
    }
  };

  const handleRestablecerPassword = async () => {
    if (!selectedUsuario) return;

    try {
      const response = await fetch(
        `${API_URL}/api/usuarios/${selectedUsuario.id}/restablecer-password/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwordData),
        }
      );

      if (response.ok) {
        toast.success("Contraseña restablecida exitosamente");
        setShowPasswordModal(false);
        setPasswordData({ nueva_password: "" });
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al restablecer contraseña");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al restablecer contraseña");
    }
  };

  const handleAsignarCentros = async () => {
    if (!selectedUsuario) return;

    try {
      const response = await fetch(
        `${API_URL}/api/usuarios/${selectedUsuario.id}/asignar-centros/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ centros_ids: centrosSeleccionados }),
        }
      );

      if (response.ok) {
        toast.success("Centros asignados exitosamente");
        setShowCentrosModal(false);
        loadUsuarios();
        setCentrosSeleccionados([]);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al asignar centros");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al asignar centros");
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      nombre_completo: "",
      email: "",
      rol: "ADMINISTRATIVO",
      centros_ids: [],
      activo: true,
    });
  };

  const openEditModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      ...formData,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
      centros_ids: usuario.centros.map((c) => c.id),
      activo: usuario.activo,
    });
    setShowEditModal(true);
  };

  const openCentrosModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setCentrosSeleccionados(usuario.centros.map((c) => c.id));
    setShowCentrosModal(true);
  };

  const openPasswordModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowPasswordModal(true);
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRolBadgeColor = (rol: string) => {
    const colors = {
      ADMIN: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
      INFORMATICO: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      ADMINISTRATIVO: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    };
    return colors[rol as keyof typeof colors] || "";
  };

  const columns = [
    {
      key: "nombre_completo",
      label: "Usuario",
      render: (value: string, row: Usuario) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.username}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "rol",
      label: "Rol",
      render: (value: string, row: Usuario) => (
        <Badge className={getRolBadgeColor(value)}>
          {row.rol_display}
        </Badge>
      ),
    },
    {
      key: "centros_nombres",
      label: "Centros Asignados",
      render: (value: string[]) => (
        <div className="text-sm">
          {value.length > 0 ? value.join(", ") : "Ninguno"}
        </div>
      ),
    },
    {
      key: "activo",
      label: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right" as const,
      render: (_: any, row: Usuario) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openPasswordModal(row)}
          >
            <Key className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openCentrosModal(row)}
            disabled={row.rol === "ADMIN"}
          >
            <Building2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administre usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Búsqueda y filtros */}
      <ModernCard>
        <ModernCardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, username o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Tabla de usuarios */}
      <ModernCard>
        <ModernCardContent>
          {usuariosFiltrados.length === 0 && !loading ? (
            <ModernEmptyState
              icon={Shield}
              title="No se encontraron usuarios"
              description="No hay usuarios que coincidan con tu búsqueda"
            />
          ) : (
            <ModernTable
              columns={columns}
              data={usuariosFiltrados}
              loading={loading}
              highlightOnHover
            />
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Modal Crear Usuario */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete la información para crear un nuevo usuario del sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="usuario123"
                />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => setFormData({ ...formData, rol: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value}>
                      {rol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.rol !== "ADMIN" && (
              <div className="space-y-2">
                <Label>Centros Asignados</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                  {centros.map((centro) => (
                    <label key={centro.id} className="flex items-center gap-2 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.centros_ids.includes(centro.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              centros_ids: [...formData.centros_ids, centro.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              centros_ids: formData.centros_ids.filter((id) => id !== centro.id),
                            });
                          }
                        }}
                      />
                      <span>{centro.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear Usuario</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar, Restablecer Password, Asignar Centros - Similar structure */}
    </div>
  );
}
