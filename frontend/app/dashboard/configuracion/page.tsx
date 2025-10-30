'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCard } from '@/components/magicui/animated-card';
import {
  Users,
  Settings,
  Database,
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  User,
  Building2,
  Shield,
  Globe,
  Flag,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { colors } from '@/lib/colors';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type TipoCatalogo = 'ETNIA' | 'NACIONALIDAD' | 'SECTOR' | 'SUBSECTOR' | 'ESTABLECIMIENTO';

interface Catalogo {
  id: number;
  tipo: TipoCatalogo;
  nombre: string;
  codigo: string | null;
  color: string | null;
  activo: boolean;
  orden: number;
}

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalogos');
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<TipoCatalogo>('ETNIA');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    establecimiento: user?.establecimiento || '',
  });

  useEffect(() => {
    fetchCatalogos();
  }, [selectedTipo]);

  const fetchCatalogos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/catalogos/?tipo=${selectedTipo}`);
      if (response.ok) {
        const data = await response.json();
        setCatalogos(data);
      }
    } catch (err) {
      console.error('Error fetching catalogos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;

    try {
      const response = await fetch(`${API_URL}/api/catalogos/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Elemento eliminado correctamente');
        fetchCatalogos();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Error al eliminar elemento');
      setTimeout(() => setError(''), 3000);
    }
  };

  const catalogoTypes = [
    { value: 'ETNIA', label: 'Etnias', icon: Users, color: colors.primary[500] },
    { value: 'NACIONALIDAD', label: 'Nacionalidades', icon: Globe, color: colors.success[500] },
    { value: 'SECTOR', label: 'Sectores', icon: MapPin, color: colors.warning[500] },
    { value: 'SUBSECTOR', label: 'Subsectores', icon: Flag, color: colors.danger[500] },
    { value: 'ESTABLECIMIENTO', label: 'Establecimientos', icon: Building2, color: colors.neutral[600] },
  ];

  const filteredCatalogos = catalogos.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <AnimatedCard delay={0}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona los parámetros del sistema</p>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </AnimatedCard>

        {success && (
          <AnimatedCard delay={0.1}>
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          </AnimatedCard>
        )}

        {error && (
          <AnimatedCard delay={0.1}>
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </AnimatedCard>
        )}

        <AnimatedCard delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="catalogos" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Catálogos
              </TabsTrigger>
              <TabsTrigger value="sistema" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Mi Perfil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="catalogos" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seleccionar Catálogo</CardTitle>
                  <CardDescription>Elige el tipo de catálogo que deseas gestionar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {catalogoTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedTipo === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setSelectedTipo(type.value as TipoCatalogo)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon className="h-6 w-6" style={{ color: type.color }} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      Agregar Nuevo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {catalogoTypes.find(t => t.value === selectedTipo)?.label}
                    <Badge variant="outline">{filteredCatalogos.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : filteredCatalogos.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No hay elementos registrados</p>
                      <p className="text-sm text-gray-500 mt-1">Agrega el primer elemento para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCatalogos.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            {item.color && (
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.nombre}</p>
                              {item.codigo && (
                                <p className="text-sm text-gray-500">{item.codigo}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sistema" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>Ajusta los parámetros generales de la aplicación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nombre del Sistema</Label>
                      <Input value="Sistema Percapita" />
                    </div>
                    <div className="space-y-2">
                      <Label>Versión</Label>
                      <Input value="2.0.0" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Región</Label>
                      <Input value="Valparaíso" />
                    </div>
                    <div className="space-y-2">
                      <Label>Servicio de Salud</Label>
                      <Input value="Servicio de Salud Viña del Mar - Quillota" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">Apariencia</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: 'Azul', color: colors.primary[500] },
                        { name: 'Verde', color: colors.success[500] },
                        { name: 'Naranja', color: colors.warning[500] },
                        { name: 'Rojo', color: colors.danger[500] },
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          className="flex items-center gap-2 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                        >
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: theme.color }}
                          />
                          <span className="text-sm">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="perfil" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {user?.nombre?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {user?.nombre} {user?.apellido}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                      <Badge variant="outline" className="mt-2">
                        <Shield className="h-3 w-3 mr-1" />
                        {user?.rol || 'Usuario'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={profileData.nombre}
                        onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={profileData.apellido}
                        onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="establecimiento">Establecimiento</Label>
                      <Input
                        id="establecimiento"
                        value={profileData.establecimiento}
                        onChange={(e) => setProfileData({ ...profileData, establecimiento: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold mb-4">Cambiar Contraseña</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input id="currentPassword" type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input id="newPassword" type="password" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <Button variant="outline">Cancelar</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </AnimatedCard>
      </div>
    </div>
  );
}
