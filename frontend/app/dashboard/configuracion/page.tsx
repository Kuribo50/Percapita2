'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Building2, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Save,
  Palette,
  Code,
  Globe,
  Flag,
  Database,
  BarChart3
} from 'lucide-react';

type Catalogo = {
  id?: number;
  tipo: TipoCatalogo;
  nombre: string;
  codigo: string | null;
  color: string | null;
  activo: boolean;
  orden: number;
};

type TipoCatalogo = 'ETNIA' | 'NACIONALIDAD' | 'SECTOR' | 'SUBSECTOR' | 'ESTABLECIMIENTO';

type SeccionConfig = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
};

type CategoriaConfig = {
  id: TipoCatalogo;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  usaCodigo: boolean;
  usaColor: boolean;
  placeholder: string;
  colorDefault: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ModalMode = 'create' | 'edit' | null;

export default function ConfiguracionPage() {
  const [catalogos, setCatalogos] = useState<Record<TipoCatalogo, Catalogo[]>>({
    ETNIA: [],
    NACIONALIDAD: [],
    SECTOR: [],
    SUBSECTOR: [],
    ESTABLECIMIENTO: []
  });
  
  const [loading, setLoading] = useState(true);
  const [seccionExpandida, setSeccionExpandida] = useState<string | null>('USUARIOS');
  const [searchTerms, setSearchTerms] = useState<Record<TipoCatalogo, string>>({
    ETNIA: '',
    NACIONALIDAD: '',
    SECTOR: '',
    SUBSECTOR: '',
    ESTABLECIMIENTO: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalCategoria, setModalCategoria] = useState<TipoCatalogo | null>(null);
  const [modalData, setModalData] = useState<{
    id?: number;
    nombre: string;
    codigo: string;
    color: string;
  }>({ nombre: '', codigo: '', color: '#3B82F6' });

  const secciones: SeccionConfig[] = [
    { 
      id: 'USUARIOS', 
      titulo: 'Gestión de Usuarios', 
      icono: <Users className="h-6 w-6" />, 
      color: 'blue',
      descripcion: 'Configuración de datos demográficos y ubicación' 
    },
    { 
      id: 'ESTABLECIMIENTOS', 
      titulo: 'Infraestructura', 
      icono: <Building2 className="h-6 w-6" />, 
      color: 'green',
      descripcion: 'Gestión de centros de salud y establecimientos' 
    },
    { 
      id: 'SISTEMA', 
      titulo: 'Configuración del Sistema', 
      icono: <Settings className="h-6 w-6" />, 
      color: 'purple',
      descripcion: 'Parámetros generales y configuraciones avanzadas' 
    }
  ];

  const categorias: Record<string, CategoriaConfig[]> = {
    USUARIOS: [
      { 
        id: 'ETNIA', 
        titulo: 'Etnias', 
        descripcion: 'Pueblos originarios y etnias reconocidas', 
        icono: <Flag className="h-5 w-5" />,
        usaCodigo: false, 
        usaColor: false,
        placeholder: 'Ej: Mapuche, Aymara',
        colorDefault: '#3B82F6'
      },
      { 
        id: 'NACIONALIDAD', 
        titulo: 'Nacionalidades', 
        descripcion: 'Países de origen de los pacientes', 
        icono: <Globe className="h-5 w-5" />,
        usaCodigo: false, 
        usaColor: false,
        placeholder: 'Ej: Chilena, Argentina',
        colorDefault: '#3B82F6'
      }
    ],
    ESTABLECIMIENTOS: [
      { 
        id: 'SECTOR', 
        titulo: 'Sectores', 
        descripcion: 'Sectores territoriales con código de color', 
        icono: <MapPin className="h-5 w-5" />,
        usaCodigo: false, 
        usaColor: true,
        placeholder: 'Ej: Verde, Azul, Rojo',
        colorDefault: '#10B981'
      },
      { 
        id: 'SUBSECTOR', 
        titulo: 'Subsectores', 
        descripcion: 'Divisiones territoriales con código identificador', 
        icono: <Code className="h-5 w-5" />,
        usaCodigo: true, 
        usaColor: false,
        placeholder: 'Ej: Frutillar Alto',
        colorDefault: '#3B82F6'
      },
      { 
        id: 'ESTABLECIMIENTO', 
        titulo: 'Establecimientos', 
        descripcion: 'Centros de salud y establecimientos médicos', 
        icono: <Building2 className="h-5 w-5" />,
        usaCodigo: false, 
        usaColor: false,
        placeholder: 'Ej: CESFAM, Hospital',
        colorDefault: '#3B82F6'
      }
    ]
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, error]);

  const mostrarMensaje = (msg: string, esError = false) => {
    if (esError) {
      setError(msg);
    } else {
      setMensaje(msg);
    }
  };

  const cargarCatalogos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/catalogos/`);
      if (response.ok) {
        const data: Catalogo[] = await response.json();
        
        const agrupados: Record<TipoCatalogo, Catalogo[]> = {
          ETNIA: [],
          NACIONALIDAD: [],
          SECTOR: [],
          SUBSECTOR: [],
          ESTABLECIMIENTO: []
        };
        
        data.forEach(catalogo => {
          if (catalogo.tipo in agrupados) {
            agrupados[catalogo.tipo as TipoCatalogo].push(catalogo);
          }
        });
        
        Object.keys(agrupados).forEach(key => {
          agrupados[key as TipoCatalogo].sort((a, b) => a.orden - b.orden);
        });
        
        setCatalogos(agrupados);
      } else {
        mostrarMensaje('Error al cargar los catálogos', true);
      }
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      mostrarMensaje('Error de conexión con el servidor', true);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode: ModalMode, categoria: TipoCatalogo, item?: Catalogo) => {
    const categoriaConfig = Object.values(categorias)
      .flat()
      .find(c => c.id === categoria);

    setModalMode(mode);
    setModalCategoria(categoria);
    
    if (mode === 'edit' && item) {
      setModalData({
        id: item.id,
        nombre: item.nombre,
        codigo: item.codigo || '',
        color: item.color || categoriaConfig?.colorDefault || '#3B82F6'
      });
    } else {
      setModalData({
        nombre: '',
        codigo: '',
        color: categoriaConfig?.colorDefault || '#3B82F6'
      });
    }
    
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setModalCategoria(null);
    setModalData({ nombre: '', codigo: '', color: '#3B82F6' });
  };

  const handleSubmitModal = async () => {
    if (!modalCategoria) return;
    
    if (!modalData.nombre.trim()) {
      mostrarMensaje('El nombre es obligatorio', true);
      return;
    }

    const categoriaConfig = Object.values(categorias)
      .flat()
      .find(c => c.id === modalCategoria);

    setGuardando(true);
    
    try {
      const payload = {
        tipo: modalCategoria,
        nombre: modalData.nombre.trim(),
        codigo: categoriaConfig?.usaCodigo && modalData.codigo ? modalData.codigo.trim() : null,
        color: categoriaConfig?.usaColor ? modalData.color : null,
        activo: true,
        orden: modalMode === 'create' ? catalogos[modalCategoria].length : undefined
      };

      const url = modalMode === 'edit' && modalData.id 
        ? `${API_URL}/api/catalogos/${modalData.id}/`
        : `${API_URL}/api/catalogos/`;
      
      const method = modalMode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await cargarCatalogos();
        closeModal();
        mostrarMensaje(
          modalMode === 'edit' 
            ? '✓ Elemento actualizado correctamente' 
            : '✓ Elemento agregado exitosamente'
        );
      } else {
        const errorData = await response.json();
        mostrarMensaje(errorData.detail || 'Error al guardar el elemento', true);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      mostrarMensaje('Error de conexión', true);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarItem = async (id: number, nombre: string) => {
    const confirmed = window.confirm(
      `⚠️ ¿Estás seguro de eliminar "${nombre}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    setGuardando(true);
    try {
      const response = await fetch(`${API_URL}/api/catalogos/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await cargarCatalogos();
        mostrarMensaje('✓ Elemento eliminado correctamente');
      } else {
        mostrarMensaje('Error al eliminar el elemento', true);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarMensaje('Error de conexión', true);
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (item: Catalogo) => {
    setGuardando(true);
    try {
      const response = await fetch(`${API_URL}/api/catalogos/${item.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !item.activo }),
      });

      if (response.ok) {
        await cargarCatalogos();
        mostrarMensaje(`✓ Elemento ${!item.activo ? 'activado' : 'desactivado'}`);
      } else {
        mostrarMensaje('Error al actualizar el estado', true);
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      mostrarMensaje('Error de conexión', true);
    } finally {
      setGuardando(false);
    }
  };

  const filtrarItems = (items: Catalogo[], tipo: TipoCatalogo) => {
    const busqueda = searchTerms[tipo].toLowerCase();
    if (!busqueda) return items;
    return items.filter(item => 
      item.nombre.toLowerCase().includes(busqueda) ||
      (item.codigo && item.codigo.toLowerCase().includes(busqueda))
    );
  };

  const obtenerEstadisticas = () => {
    let total = 0;
    let activos = 0;
    Object.values(catalogos).forEach(lista => {
      total += lista.length;
      activos += lista.filter(c => c.activo).length;
    });
    return { total, activos, inactivos: total - activos };
  };

  const stats = obtenerEstadisticas();

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header Premium */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/20 p-4 backdrop-blur-sm ring-1 ring-white/30">
                  <Settings className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Configuración del Sistema</h1>
                  <p className="text-blue-100">
                    Gestiona los catálogos y parámetros de la aplicación
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Database className="h-4 w-4" />
                    </div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <div className="text-xs text-blue-100 mt-1">Total Items</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="text-3xl font-bold text-green-300">{stats.activos}</div>
                    <div className="text-xs text-blue-100 mt-1">Activos</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="text-3xl font-bold text-amber-300">{stats.inactivos}</div>
                    <div className="text-xs text-blue-100 mt-1">Inactivos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {mensaje && (
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-green-800 dark:text-green-200 font-medium flex-1">{mensaje}</p>
            <button onClick={() => setMensaje(null)} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-red-800 dark:text-red-200 font-medium flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400" />
              <Settings className="absolute inset-0 m-auto h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Cargando configuración...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Secciones */}
            {secciones.map((seccion) => {
              const categoriasSeccion = categorias[seccion.id] || [];
              const colors = colorClasses[seccion.color];
              
              return (
                <div key={seccion.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Header de Sección */}
                  <button
                    onClick={() => setSeccionExpandida(seccionExpandida === seccion.id ? null : seccion.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-xl ${colors.bg} p-3 ${colors.text} ring-1 ${colors.border}`}>
                        {seccion.icono}
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {seccion.titulo}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{seccion.descripcion}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        seccionExpandida === seccion.id ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Contenido Expandible */}
                  {seccionExpandida === seccion.id && (
                    <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                      <div className="p-6 space-y-6">
                        {categoriasSeccion.map((categoria) => {
                          const items = catalogos[categoria.id];
                          const itemsFiltrados = filtrarItems(items, categoria.id);
                          
                          return (
                            <div key={categoria.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                              {/* Header de Categoría */}
                              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                                      {categoria.icono}
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{categoria.titulo}</h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{categoria.descripcion}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => openModal('create', categoria.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Agregar
                                  </button>
                                </div>
                              </div>

                              {/* Barra de Búsqueda */}
                              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                      type="text"
                                      value={searchTerms[categoria.id]}
                                      onChange={(e) => setSearchTerms({ ...searchTerms, [categoria.id]: e.target.value })}
                                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Buscar por nombre o código..."
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <BarChart3 className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {itemsFiltrados.length} / {items.length}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Lista de Items */}
                              <div className="p-6">
                                {itemsFiltrados.length === 0 ? (
                                  <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                      <Database className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                                      {searchTerms[categoria.id] 
                                        ? 'No se encontraron resultados' 
                                        : 'No hay elementos. Agrega el primero.'}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {itemsFiltrados.map((item, index) => (
                                      <div
                                        key={item.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                          item.activo
                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-60'
                                        }`}
                                      >
                                        {/* Número de orden */}
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400">
                                          {index + 1}
                                        </div>

                                        {/* Color indicator */}
                                        {categoria.usaColor && item.color && (
                                          <div className="relative group">
                                            <div
                                              className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                              style={{ backgroundColor: item.color }}
                                              title={`Color: ${item.color}`}
                                            />
                                            <Palette className="absolute bottom-1 right-1 h-3 w-3 text-white drop-shadow-lg" />
                                          </div>
                                        )}

                                        {/* Código */}
                                        {categoria.usaCodigo && (
                                          <div className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                                              {item.codigo || '-'}
                                            </span>
                                          </div>
                                        )}

                                        {/* Nombre */}
                                        <div className="flex-1 min-w-0">
                                          <span className={`text-base font-semibold truncate block ${
                                            item.activo ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                          }`}>
                                            {item.nombre}
                                          </span>
                                        </div>

                                        {/* Estado */}
                                        <button
                                          onClick={() => toggleActivo(item)}
                                          disabled={guardando}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                            item.activo
                                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                          {item.activo ? (
                                            <>
                                              <Check className="h-3 w-3" />
                                              Activo
                                            </>
                                          ) : (
                                            <>
                                              <X className="h-3 w-3" />
                                              Inactivo
                                            </>
                                          )}
                                        </button>

                                        {/* Acciones */}
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => openModal('edit', categoria.id, item)}
                                            disabled={guardando}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                                            title="Editar"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => eliminarItem(item.id!, item.nombre)}
                                            disabled={guardando}
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                            title="Eliminar"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal para Crear/Editar */}
        {modalOpen && modalCategoria && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      {modalMode === 'edit' ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {modalMode === 'edit' ? 'Editar' : 'Agregar'}{' '}
                        {Object.values(categorias).flat().find(c => c.id === modalCategoria)?.titulo}
                      </h2>
                      <p className="text-sm text-blue-100 mt-0.5">
                        {Object.values(categorias).flat().find(c => c.id === modalCategoria)?.descripcion}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalData.nombre}
                    onChange={(e) => setModalData({ ...modalData, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={Object.values(categorias).flat().find(c => c.id === modalCategoria)?.placeholder}
                    autoFocus
                  />
                </div>

                {/* Código */}
                {Object.values(categorias).flat().find(c => c.id === modalCategoria)?.usaCodigo && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Código
                    </label>
                    <input
                      type="text"
                      value={modalData.codigo}
                      onChange={(e) => setModalData({ ...modalData, codigo: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      placeholder="Ej: V1, A2"
                    />
                  </div>
                )}

                {/* Color */}
                {Object.values(categorias).flat().find(c => c.id === modalCategoria)?.usaColor && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={modalData.color}
                        onChange={(e) => setModalData({ ...modalData, color: e.target.value })}
                        className="w-20 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={modalData.color}
                        onChange={(e) => setModalData({ ...modalData, color: e.target.value })}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitModal}
                    disabled={guardando || !modalData.nombre.trim()}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    {guardando ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {modalMode === 'edit' ? 'Actualizar' : 'Guardar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}