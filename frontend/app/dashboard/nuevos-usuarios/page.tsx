'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/magicui/animated-card';
import NumberTicker from '@/components/magicui/number-ticker';
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface NuevoUsuario {
  id: number;
  run: string;
  nombreCompleto: string;
  fechaSolicitud: string;
  periodoMes: number;
  periodoAnio: number;
  nacionalidad?: string;
  etnia?: string;
  sector?: string;
  subsector?: string;
  codigoPercapita?: string;
  establecimiento?: string;
  observaciones?: string;
  estado: 'PENDIENTE' | 'VALIDADO' | 'NO_VALIDADO';
  creadoEl: string;
}

interface Estadisticas {
  total: number;
  pendientes: number;
  validados: number;
  noValidados: number;
}

export default function NuevosUsuariosPage() {
  const [usuarios, setUsuarios] = useState<NuevoUsuario[]>([]);
  const [stats, setStats] = useState<Estadisticas>({ total: 0, pendientes: 0, validados: 0, noValidados: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    run: '',
    nombreCompleto: '',
    fechaSolicitud: new Date().toISOString().split('T')[0],
    periodoMes: new Date().getMonth() + 1,
    periodoAnio: new Date().getFullYear(),
    nacionalidad: '',
    etnia: '',
    sector: '',
    subsector: '',
    codigoPercapita: '',
    establecimiento: '',
    observaciones: ''
  });

  useEffect(() => {
    fetchUsuarios();
  }, [filterEstado, searchTerm]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterEstado) params.append('estado', filterEstado);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_URL}/api/nuevos-usuarios/?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.usuarios || []);
        setStats(data.estadisticas || { total: 0, pendientes: 0, validados: 0, noValidados: 0 });
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/nuevos-usuarios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchUsuarios();
        // Reset form
        setFormData({
          run: '',
          nombreCompleto: '',
          fechaSolicitud: new Date().toISOString().split('T')[0],
          periodoMes: new Date().getMonth() + 1,
          periodoAnio: new Date().getFullYear(),
          nacionalidad: '',
          etnia: '',
          sector: '',
          subsector: '',
          codigoPercapita: '',
          establecimiento: '',
          observaciones: ''
        });
      }
    } catch (error) {
      console.error('Error creating usuario:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'VALIDADO':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Validado</Badge>;
      case 'NO_VALIDADO':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />No Validado</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>;
    }
  };

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.total,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Validados',
      value: stats.validados,
      icon: CheckCircle2,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Pendientes',
      value: stats.pendientes,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'No Validados',
      value: stats.noValidados,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <AnimatedCard delay={0}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nuevos Usuarios</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona los usuarios que llegan antes del corte mensual</p>
            </div>
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Agregar Usuario
            </Button>
          </div>
        </AnimatedCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard key={stat.title} delay={0.1 + index * 0.05}>
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {loading ? '...' : <NumberTicker value={stat.value} />}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Filters & Search */}
        <AnimatedCard delay={0.3}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por RUN o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="VALIDADO">Validados</option>
                  <option value="NO_VALIDADO">No Validados</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Users Table */}
        <AnimatedCard delay={0.4}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">RUN</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre Completo</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha Solicitud</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Periodo</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Cargando usuarios...</span>
                          </div>
                        </td>
                      </tr>
                    ) : usuarios.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-12 w-12 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400 font-medium">No hay usuarios registrados</p>
                            <p className="text-sm text-gray-500">Agrega el primer usuario para comenzar</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      usuarios.map((usuario, index) => (
                        <tr
                          key={usuario.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4 text-sm font-mono text-gray-900 dark:text-white">{usuario.run}</td>
                          <td className="p-4 text-sm text-gray-900 dark:text-white">{usuario.nombreCompleto}</td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(usuario.fechaSolicitud).toLocaleDateString('es-CL')}
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                            {usuario.periodoMes}/{usuario.periodoAnio}
                          </td>
                          <td className="p-4">{getEstadoBadge(usuario.estado)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Modal for Add User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agregar Nuevo Usuario</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Complete los datos del usuario</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="run">RUN *</Label>
                  <Input
                    id="run"
                    value={formData.run}
                    onChange={(e) => setFormData({ ...formData, run: e.target.value })}
                    placeholder="12.345.678-9"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                  <Input
                    id="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="Juan Pérez González"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaSolicitud">Fecha Solicitud *</Label>
                  <Input
                    id="fechaSolicitud"
                    type="date"
                    value={formData.fechaSolicitud}
                    onChange={(e) => setFormData({ ...formData, fechaSolicitud: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="establecimiento">Establecimiento</Label>
                  <Input
                    id="establecimiento"
                    value={formData.establecimiento}
                    onChange={(e) => setFormData({ ...formData, establecimiento: e.target.value })}
                    placeholder="CESFAM Los Aromos"
                  />
                </div>
                <div>
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <Input
                    id="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                    placeholder="Chilena"
                  />
                </div>
                <div>
                  <Label htmlFor="etnia">Etnia</Label>
                  <Input
                    id="etnia"
                    value={formData.etnia}
                    onChange={(e) => setFormData({ ...formData, etnia: e.target.value })}
                    placeholder="Mapuche"
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="Sector 1"
                  />
                </div>
                <div>
                  <Label htmlFor="codigoPercapita">Código Percapita</Label>
                  <Input
                    id="codigoPercapita"
                    value={formData.codigoPercapita}
                    onChange={(e) => setFormData({ ...formData, codigoPercapita: e.target.value })}
                    placeholder="PC-12345"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas adicionales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Guardar Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
